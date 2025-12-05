import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowLeft, Copy, Image as ImageIcon, Plus, RotateCcw, Send, Sparkles, Trash2, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

// --- Animations Helper Component ---
const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

const ScaleButton = ({ onPress, style, children, disabled }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.8}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedPressable>
  );
};

// --- Optimized Message Component ---
const MessageItem = React.memo(({ item, index, onCopy }: { item: Message, index: number, onCopy: (text: string) => void }) => {
  const isUser = item.role === "user";
  const text = item.content?.find((c) => c.type === "text")?.text || "";
  const image = item.content?.find((c) => c.type === "image_url")?.image_url?.url || null;

  if (item.role === "system") return null;

  // Entry animation
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1))
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? { justifyContent: 'flex-end', paddingLeft: 40 } : { justifyContent: 'flex-start', paddingRight: 40 },
        { opacity: fade, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Sparkles size={16} color="#C084FC" />
        </View>
      )}

      <View style={{ width: '100%' }}>
        {isUser ? (
          <View style={{ alignItems: 'flex-end' }}>
            <LinearGradient
              colors={["#6366F1", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.userBubble]}
            >
              {image && <Image source={{ uri: image }} style={styles.messageImage} />}
              {text !== "" && <Text style={styles.userText}>{text}</Text>}
            </LinearGradient>
          </View>
        ) : (
          <View style={[styles.messageBubble, styles.botBubble]}>
            {image && <Image source={{ uri: image }} style={styles.messageImage} />}
            {text !== "" && <Text style={styles.botText}>{text}</Text>}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.copyIcon}
                onPress={() => onCopy(text)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Copy size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName, agentPrompt, agentId, chatId, messageList } = useLocalSearchParams();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  const [docId, setDocId] = useState<string>(
    typeof chatId === "string" ? chatId : Date.now().toString()
  );

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastScale = useRef(new Animated.Value(0.8)).current;

  // Header setup 
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start();
  }, []);

  // Menu Animation
  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: showMenu ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60
    }).start();
  }, [showMenu]);

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

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

  // Copy message animation
  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
    setCopiedMsg(text);

    toastOpacity.setValue(0);
    toastScale.setValue(0.8);

    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(toastScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCopiedMsg(null));
    }, 2000);
  };

  // Actions
  const handleClearChat = async () => {
    setMessages(agentPrompt ? [{ role: "system", content: [{ type: "text", text: agentPrompt }] }] : []);
    setShowMenu(false);
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Premium Background Gradient */}
      <LinearGradient
        colors={['#020617', '#0F172A', '#1E1B4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Custom Premium Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 8, opacity: fadeAnim }]}>
        <ScaleButton onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#F8FAFC" size={20} />
        </ScaleButton>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{agentName || "Chat"}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: isTyping ? "#A855F7" : "#22C55E" }]} />
            <Text style={styles.headerStatus}>
              {isTyping ? "AI is typing..." : "Active"}
            </Text>
          </View>
        </View>

        <ScaleButton onPress={() => setShowMenu(true)} style={styles.iconButton}>
          <Plus color="#F8FAFC" size={24} />
        </ScaleButton>
      </Animated.View>

      {/* Overlay Menu for Plus Icon */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <Animated.View style={[styles.menuContainer, {
                top: insets.top + 60,
                transform: [{
                  scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
                }, {
                  translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })
                }],
                opacity: menuAnim
              }]}>
                <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
                  <Trash2 size={16} color="#EF4444" style={{ marginRight: 10 }} />
                  <Text style={[styles.menuText, { color: "#EF4444" }]}>Clear Chat</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
                  <RotateCcw size={16} color="#94A3B8" style={{ marginRight: 10 }} />
                  <Text style={styles.menuText}>Restart Agent</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 16
          }}
          renderItem={({ item, index }) => <MessageItem item={item} index={index} onCopy={copyToClipboard} />}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Image Preview */}
        {selectedImage && (
          <Animated.View style={styles.imagePreviewContainerEntering}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.imageCancelBtn} onPress={() => setSelectedImage(null)}>
              <X color="#fff" size={12} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Floating Toast */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ scale: toastScale }],
            },
          ]}
        >
          <Sparkles size={16} color="#4ADE80" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>Copied to clipboard!</Text>
        </Animated.View>

        {/* Premium Input Bar */}
        <View style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
            paddingTop: 12
          }
        ]}>
          <View style={styles.inputInnerRow}>
            <ScaleButton onPress={pickImage} style={styles.attachButton}>
              <ImageIcon size={22} color="#94A3B8" />
            </ScaleButton>

            <View style={styles.inputWrapper}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message..."
                placeholderTextColor="#64748B"
                style={styles.input}
                multiline
                maxLength={500}
              />
            </View>

            <ScaleButton
              onPress={onSendMessage}
              disabled={!inputText.trim() && !selectedImage}
              style={[
                styles.sendButton,
                (!inputText.trim() && !selectedImage) && styles.sendButtonDisabled
              ]}
            >
              <Send size={20} color="#fff" style={{ marginLeft: 2 }} />
            </ScaleButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(15, 23, 42, 0.8)", // More transparency for glass effect
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: 'center',
    zIndex: -1, // Behind buttons
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(71, 85, 105, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 11,
    color: "#E2E8F0",
    fontWeight: '500',
  },
  /* Menu */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    position: 'absolute',
    right: 20,
    width: 180,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  menuText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 4,
  },
  /* Chat */
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24, // Increased spacing between messages
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.2)",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
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
    lineHeight: 24,
    fontWeight: "400",
  },
  botText: {
    color: "#E2E8F0",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "300",
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  copyIcon: {
    opacity: 0.6,
    padding: 4,
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 16,
    marginBottom: 10,
    resizeMode: 'cover',
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  /* Input Section */
  inputContainer: {
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
  },
  inputInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 10,
    marginRight: 8,
    marginBottom: 2,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minHeight: 48, // Slightly taller
    justifyContent: 'center',
  },
  input: {
    color: "#F8FAFC",
    fontSize: 16,
    maxHeight: 120,
    lineHeight: 22,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: "#6366F1",
    width: 46, // Slightly larger
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  sendButtonDisabled: {
    backgroundColor: "#1E293B",
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.5,
    borderColor: "transparent",
  },
  /* Extras */
  imagePreviewContainerEntering: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    backgroundColor: "#1E293B",
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imageCancelBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#1E293B",
  },
  toast: {
    position: 'absolute',
    top: 130, // Lowered slightly
    alignSelf: 'center',
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  toastText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
