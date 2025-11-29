import { useUser } from "@clerk/clerk-expo";
import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
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
  const { agentName, agentPrompt, agentId, chatId } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { user } = useUser();

  const [docId] = useState<string>(
    typeof chatId === "string" ? chatId : Date.now().toString()
  );

  /* HEADER */
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName || "Chat",
      headerRight: () => <Plus color="#000" size={22} />,
    });
  }, []);

  /* SYSTEM MESSAGE */
  useEffect(() => {
    if (agentPrompt) {
      setMessages([{ role: "system", content: [{ type: "text", text: agentPrompt }] }]);
    }
  }, [agentPrompt]);

  /* PICK IMAGE */
  const pickImage = async () => {
    const result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  /* CLEAN FIRESTORE PAYLOAD (NO undefined!) */
  const buildPayload = () => {
    const payload: any = {
      messages,
      docId,
    };

    if (user?.primaryEmailAddress?.emailAddress)
      payload.userEmail = user.primaryEmailAddress.emailAddress;

    if (agentName) payload.agentName = agentName;
    if (agentPrompt) payload.agentPrompt = agentPrompt;
    if (agentId) payload.agentId = agentId;

    return payload;
  };

  /* SAVE TO FIRESTORE */
  useEffect(() => {
    if (!user || messages.length === 0) return;

    const saveMessages = async () => {
      const payload = buildPayload();
      await setDoc(doc(firestoreDb, "conversations", docId), payload, { merge: true });
    };

    saveMessages();
  }, [messages]);

  /* UPLOAD IMAGE */
  const uploadImageToStorage = async (file: string) => {
    const response = await fetch(file);
    const blobFile = await response.blob();

    const path = `BrahmaAi/${Date.now()}.png`;
    const imageRef = ref(storage, path);

    await uploadBytes(imageRef, blobFile);
    return await getDownloadURL(imageRef);
  };

  /* COPY */
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

  /* SEND */
  const onSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText && !selectedImage) return;

    let content: any[] = [];

    if (trimmedText) {
      content.push({ type: "text", text: trimmedText });
    }

    if (selectedImage) {
      const uploadedUrl = await uploadImageToStorage(selectedImage);
      content.push({
        type: "image_url",
        image_url: { url: uploadedUrl },
      });
    }

    const userMessage: Message = {
      role: "user",
      content,
      ...(selectedImage ? { image: selectedImage } : {}),
    };

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

  /* KEYBOARD */
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [keyboard.keyboardShown]);

  /* AUTO SCROLL */
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          padding: 12,
          paddingTop: 16,
          paddingBottom: 160,
        }}
        renderItem={({ item }) => {
          if (item.role === "system") return null;

          const firstText =
            item.content?.find((c: any) => c.type === "text")?.text || "";

          const firstImage =
            item.content?.find((c: any) => c.type === "image_url")
              ?.image_url?.url || null;

          return (
            <View
              style={[
                styles.messageContainer,
                item.role === "user" ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {firstImage && (
                <Image
                  source={{ uri: firstImage }}
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                />
              )}

              {firstText !== "" && (
                <Text
                  style={[
                    styles.messageText,
                    item.role === "user" ? { color: "#fff" } : { color: "#111" },
                  ]}
                >
                  {firstText}
                </Text>
              )}

              {item.role === "assistant" && firstText && (
                <TouchableOpacity
                  style={styles.copyIconBottomRight}
                  onPress={() => copyToClipboard(firstText)}
                >
                  <Copy size={16} color="#555" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          isTyping ? (
            <Text
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                color: "#555",
                fontStyle: "italic",
              }}
            >
              AI is typing...
            </Text>
          ) : null
        }
      />

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <Animated.View
          style={[
            styles.imagePreviewBox,
            {
              bottom: keyboard.keyboardShown
                ? keyboard.keyboardHeight + 70
                : 120,
            },
          ]}
        >
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.imageCancelBtn}
            onPress={() => setSelectedImage(null)}
          >
            <X color="#fff" size={16} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* COPY POPUP */}
      {copiedMsg && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              bottom:
                (keyboard.keyboardShown ? keyboard.keyboardHeight : 70) + 50,
            },
          ]}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            ✓ Message copied
          </Text>
        </Animated.View>
      )}

      {/* BOTTOM BAR */}
      <Animated.View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 10, bottom: bottomAnim },
        ]}
      >
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

/* ⭐ SAME CSS - NOT CHANGED */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF1F6" },
  messageContainer: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
    maxWidth: "78%",
    position: "relative",
  },
  userMessage: {
    backgroundColor: "#5B4BFF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    shadowColor: "#5B4BFF",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: { fontSize: 15.5, lineHeight: 20 },
  copyIconBottomRight: { position: "absolute", bottom: 4, right: 6 },
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
