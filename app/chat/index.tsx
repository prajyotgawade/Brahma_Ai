import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { Copy, Image as ImageIcon, Plus, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
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
};

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName, agentPrompt } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

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

  // COPY TO CLIPBOARD
  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
    setCopiedMsg(text);
    setTimeout(() => setCopiedMsg(null), 1500);
  };

  // SEND MESSAGE FUNCTION
  const onSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    const userMessage: Message = { role: "user", content: trimmedText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    setIsTyping(true);

    try {
      const allMessages = [...messages, userMessage];
      const result = await AIChatModel(allMessages);

      if (result && result.aiResponse) {
        const aiMessage: Message = {
          role: "assistant",
          content:
            typeof result.aiResponse === "string"
              ? result.aiResponse
              : result.aiResponse.content,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.log("AI error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // BOTTOM BAR ANIMATION
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [keyboard.keyboardShown, keyboard.keyboardHeight]);

  // AUTO-SCROLL
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 12, paddingTop: 16, paddingBottom: 120 }}
        renderItem={({ item }: { item: Message }) => {
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
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" ? { color: "#fff" } : { color: "#111" },
                ]}
              >
                {item.content}
              </Text>

              {/* Copy icon at bottom-right corner for AI messages */}
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

      {/* COPIED TOAST */}
      {copiedMsg && (
        <View style={styles.toast}>
          <Text style={{ color: "#fff" }}>Message copied to clipboard</Text>
        </View>
      )}

      {/* BOTTOM CHAT BAR */}
      <Animated.View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 10, bottom: bottomAnim },
        ]}
      >
        <TouchableOpacity style={styles.iconButton}>
          <ImageIcon size={23} color="#555" />
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
  container: { flex: 1, backgroundColor: "#EEF1F6" },

  messageContainer: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
    maxWidth: "78%",
    position: "relative", // allow absolute positioning inside
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
    bottom: 80,
    left: 50,
    right: 50,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
