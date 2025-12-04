import { useUser } from "@clerk/clerk-expo";
import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Copy, Image as ImageIcon, Plus, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
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
  const { agentName, agentPrompt, agentId, chatId, messageList } =
    useLocalSearchParams();
  const { user } = useUser();
  const keyboard = useKeyboard();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current;

  const [docId, setDocId] = useState<string>(
    typeof chatId === "string" ? chatId : Date.now().toString()
  );

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Header setup
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName || "Chat",
      headerStyle: { backgroundColor: "#4F46E5", shadowOpacity: 0 },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "700", fontSize: 20 },
      headerRight: () => <Plus color="#fff" size={22} />,
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

  // Keyboard animation
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [keyboard.keyboardShown]);

  // Auto scroll
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

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

    return (
      <Animated.View style={{ opacity: 1, transform: [{ scale: 1 }] }}>
        <View
          style={[
            styles.messageContainer,
            item.role === "user" ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          {image && <Image source={{ uri: image }} style={styles.messageImage} />}
          {text !== "" && (
            <Text
              style={[
                styles.messageText,
                item.role === "user" ? { color: "#fff" } : { color: "#111" },
              ]}
            >
              {text}
            </Text>
          )}
          {item.role === "assistant" && text && (
            <TouchableOpacity
              style={styles.copyIconBottomRight}
              onPress={() => copyToClipboard(text)}
            >
              <Copy size={16} color="#555" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        renderItem={renderItem}
        ListFooterComponent={
          isTyping ? (
            <Text style={{ color: "#555", fontStyle: "italic", paddingHorizontal: 16 }}>
              AI is typing...
            </Text>
          ) : null
        }
      />

      {selectedImage && (
        <Animated.View style={[styles.imagePreviewBox, { bottom: keyboard.keyboardShown ? keyboard.keyboardHeight + 70 : 120 }]}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.imageCancelBtn} onPress={() => setSelectedImage(null)}>
            <X color="#fff" size={16} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {copiedMsg && (
        <Animated.View style={[styles.toast, { opacity: opacityAnim, transform: [{ scale: scaleAnim }], bottom: (keyboard.keyboardShown ? keyboard.keyboardHeight : 70) + 50 }]}>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>✓ Message copied</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, bottom: bottomAnim }]}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <ImageIcon size={24} color="#555" />
        </TouchableOpacity>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message…"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 14,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: "78%",
    position: "relative",
  },
  userMessage: {
    backgroundColor: "#5B4BFF",
    alignSelf: "flex-end",
    shadowColor: "#5B4BFF",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: { fontSize: 15.5, lineHeight: 20 },
  messageImage: { width: 180, height: 180, borderRadius: 12, marginBottom: 8 },
  copyIconBottomRight: { position: "absolute", bottom: 6, right: 8 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E0E3E7",
  },
  iconButton: { padding: 6, marginRight: 6 },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#F2F4F7",
    borderRadius: 25,
    fontSize: 15,
    color: "#000",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#5B4BFF",
    padding: 11,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  toast: {
    position: "absolute",
    left: 50,
    right: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(30,30,30,0.88)",
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  imagePreviewBox: {
    position: "absolute",
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  imageCancelBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 20,
  },
});
