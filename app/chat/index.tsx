import { useKeyboard } from "@react-native-community/hooks";
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Image as ImageIcon, Plus, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// FIXED: Use `content` for all messages
const initialMessages = [
  { role: 'user', content: 'Hi there! 👋' },
  { role: 'assistant', content: 'Hello! How can I help you today? 😊' },
  { role: 'user', content: 'Hi there! 👋' },
  { role: 'assistant', content: 'Hello! How can I help you today? 😊' },
];

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName } = useLocalSearchParams();

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();

  // Header Setup
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName || "Chat",
      headerRight: () => <Plus color="#000" size={22} />,
    });
  }, []);

  // SEND MESSAGE FIXED
  const onSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = { role: "user", content: inputText };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");

  };

  // Keyboard animation fix
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: keyboard.keyboardShown ? keyboard.keyboardHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [keyboard.keyboardShown, keyboard.keyboardHeight]);

  // Scroll bottom on new message
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 15, paddingBottom: 130 }}
        renderItem={({ item }) => (
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
                item.role === "user"
                  ? { color: "#fff" }
                  : { color: "#111" },
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />

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
});
