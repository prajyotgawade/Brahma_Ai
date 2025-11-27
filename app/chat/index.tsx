import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
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
import { AIChatModel } from "../shared/GlobalApi";

type Message = {
  role: string;
  content: string;
  image?: string;
};

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName, agentPrompt } = useLocalSearchParams();

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

  // HEADER
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName || "Chat",
      headerRight: () => <Plus color="#000" size={22} />,
    });
  }, []);

  // INITIAL SYSTEM PROMPT
  useEffect(() => {
    if (agentPrompt) {
      setMessages([{ role: "system", content: agentPrompt as string }]);
    }
  }, [agentPrompt]);

  // PICK IMAGE
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // COPY MESSAGE
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

  // SEND MESSAGE
  const onSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText && !selectedImage) return;

    const userMessage: Message = {
      role: "user",
      content: trimmedText,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const result = await AIChatModel([...messages, userMessage]);

      if (result && result.aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              typeof result.aiResponse === "string"
                ? result.aiResponse
                : result.aiResponse.content,
          },
        ]);
      }
    } catch (err) {
      console.log("AI error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // BOTTOM SPACING ANIMATION
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [keyboard.keyboardShown]);

  // AUTO SCROLL
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      {/* CHAT LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{
          padding: 12,
          paddingTop: 16,
          paddingBottom: 160,
        }}
        renderItem={({ item }) => {
          if (item.role === "system") return null;

          return (
            <View
              style={[
                styles.messageContainer,
                item.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage,
              ]}
            >
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                />
              )}

              <Text
                style={[
                  styles.messageText,
                  item.role === "user" ? { color: "#fff" } : { color: "#111" },
                ]}
              >
                {item.content}
              </Text>

              {item.role === "assistant" && (
                <TouchableOpacity
                  style={styles.copyIconBottomRight}
                  onPress={() => copyToClipboard(item.content)}
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

      {/* IMAGE PREVIEW ABOVE INPUT BAR */}
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
            <X size={16} color="#fff" />
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

/* 🔥 ONLY the required style fixes made */
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

  copyIconBottomRight: {
    position: "absolute",
    bottom: 4,
    right: 6,
  },

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
    backgroundColor: "rgba(30, 30, 30, 0.88)",
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  /* 🔥 FIXED ONLY THIS PART */
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

  /* 🔥 FIXED marginRight from 60 → 12 */
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
