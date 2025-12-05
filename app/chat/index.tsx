import { useUser } from "@clerk/clerk-expo";
import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowLeft, Copy, Image as ImageIcon, Plus, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { firestoreDb, storage } from "../../config/Firebaseconfig";
import { AIChatModel } from "../shared/GlobalApi";

type Message = {
  role: string;
  content: any[];
  image?: string;
};

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName, agentPrompt, agentId, chatId, messageList } = useLocalSearchParams();
  const { user } = useUser();
  const keyboard = useKeyboard();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current; // For input bar movement
  const fadeAnim = useRef(new Animated.Value(0)).current; // For header entry?

  const [docId, setDocId] = useState<string>(
    typeof chatId === "string" ? chatId : Date.now().toString()
  );

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Header setup - Custom Header for maximum control
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // We will build our own custom header
    });
  }, []);

  // Load chat
  useEffect(() => {
    (async () => {
      if (!docId) return;
      const snap = await getDoc(doc(firestoreDb, "conversations", docId));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.messages?.length > 0) {
          setMessages(data?.messages);
          return;
        }
      }

      if (messageList) {
        setMessages(JSON.parse(messageList as string));
      } else if (agentPrompt) {
        setMessages([
          { role: "system", content: [{ type: "text", text: agentPrompt }] },
        ]);
      }
    })();
  }, []);

  // Save chat
  useEffect(() => {
    if (!user || messages.length === 0) return;
    setDoc(
      doc(firestoreDb, "conversations", docId),
      {
        docId,
        userEmail: user.primaryEmailAddress?.emailAddress || "",
        agentName: agentName || "",
        agentPrompt: agentPrompt || "",
        agentId: agentId || "",
        messages,
        lastModified: Date.now(),
      },
      { merge: true }
    );
  }, [messages]);

  // Keyboard animation for Input Bar
  //   useEffect(() => {
  //     Animated.spring(bottomAnim, {
  //       toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
  //       useNativeDriver: false,
  //       friction: 8,
  //     }).start();
  //   }, [keyboard.keyboardShown]);
  // NOTE: Using KeyboardAvoidingView instead for smoother native behavior on chat

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping, keyboard.keyboardShown]);

  // Pick image
  const pickImage = async () => {
    const result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  // Upload image
  const uploadImageToStorage = async (file: string) => {
    const response = await fetch(file);
    const blobFile = await response.blob();
    const path = `BrahmaAi/${Date.now()}.png`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, blobFile);
    return await getDownloadURL(imageRef);
  };

  // Copy message
  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
    setCopiedMsg(text);

    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setCopiedMsg(null));
    }, 1500);
  };

  // Send message
  const onSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    let content: any[] = [];
    if (inputText.trim()) content.push({ type: "text", text: inputText.trim() });
    if (selectedImage) {
      const uploadedUrl = await uploadImageToStorage(selectedImage);
      content.push({ type: "image_url", image_url: { url: uploadedUrl } });
    }

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setSelectedImage(null);
    setInputText("");
    setIsTyping(true);

    try {
      const result = await AIChatModel([...messages, userMessage]);
      if (result?.aiResponse) {
        const assistantMessage: Message = {
          role: "assistant",
          content:
            typeof result.aiResponse === "string"
              ? [{ type: "text", text: result.aiResponse }]
              : result.aiResponse.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.log("AI ERROR:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Render chat message
  const renderItem = ({ item }: { item: Message }) => {
    if (item.role === "system") return null;

    const text = item.content?.find((c) => c.type === "text")?.text || "";
    const image = item.content?.find((c) => c.type === "image_url")?.image_url?.url || null;
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            {/* Placeholder for Bot Icon, could use agent image if available */}
            <Text style={{ fontSize: 20 }}>🤖</Text>
          </View>
        )}

        <View style={{ maxWidth: "75%" }}>
          {isUser ? (
            <LinearGradient
              colors={["#6366F1", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.userBubble]}
            >
              {image && <Image source={{ uri: image }} style={styles.messageImage} />}
              {text !== "" && <Text style={styles.userText}>{text}</Text>}
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.botBubble]}>
              {image && <Image source={{ uri: image }} style={styles.messageImage} />}
              {text !== "" && <Text style={styles.botText}>{text}</Text>}

              <TouchableOpacity
                style={styles.copyIcon}
                onPress={() => copyToClipboard(text)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Copy size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#F8FAFC" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{agentName || "Chat"}</Text>
          <Text style={styles.headerStatus}>
            {isTyping ? "Typing..." : "Online"}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Plus color="#F8FAFC" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 20,
            paddingTop: 10
          }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.imageCancelBtn} onPress={() => setSelectedImage(null)}>
              <X color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        )}

        {/* Copy Toast */}
        {copiedMsg && (
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.toastText}>✓ Copied to clipboard</Text>
          </Animated.View>
        )}

        {/* Input Bar */}
        <View style={[
          styles.inputContainer,
          { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 5 : 12 }
        ]}>
          <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
            <ImageIcon size={24} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#64748B"
              style={styles.input}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() && !selectedImage) && styles.sendButtonDisabled]}
            onPress={onSendMessage}
            disabled={!inputText.trim() && !selectedImage}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#1E1B4B",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: 'center',
  },
  headerStatus: {
    fontSize: 12,
    color: "#A855F7",
    textAlign: 'center',
    fontWeight: '600',
  },
  headerRight: {
    padding: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    minWidth: 60,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: "#E2E8F0",
    fontSize: 16,
    lineHeight: 22,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  copyIcon: {
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  attachButton: {
    padding: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    color: "#F8FAFC",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#6366F1",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  imagePreviewContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: "#1E293B",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 5,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imageCancelBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 4,
  },
  toast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: "rgba(16, 185, 129, 0.9)", // Green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
