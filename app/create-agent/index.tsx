import { firestoreDb } from "@/config/Firebaseconfig";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../shared/ThemeContext";

export default function CreateAgent() {
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [emoji, setEmoji] = useState("🤖");
  const [agentName, setAgentName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = [
    "🤖", "🧠", "⚡", "🔥", "👨‍💻", "🦾", "💡", "📡", "🎯", "🛠️",
    "📘", "📁", "📱", "💎", "✨", "🚀", "🧩", "🤝", "📈", "🔍",
    "🔮", "🪄", "🎨", "🌐", "🔧", "📝"
  ];

  const CreateNewAgent = async () => {
    if (!agentName.trim() || !emoji.trim() || !instructions.trim()) {
      Alert.alert("Missing Details", "Please fill in all fields to create your agent.");
      return;
    }

    try {
      const agentId = Date.now().toString();

      await setDoc(doc(firestoreDb, "agents", agentId), {
        emoji,
        agentName,
        agentId,
        prompt: instructions,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdBy: user?.id,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
      });

      Alert.alert("Success", "Your AI Agent has been created!", [
        { text: "Later", style: "cancel" },
        {
          text: "Chat Now",
          onPress: () =>
            router.push({
              pathname: "/chat",
              params: {
                agentName,
                initialText: "",
                agentPrompt: instructions,
                agentId,
              },
            }),
        },
      ]);

      setAgentName("");
      setInstructions("");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong! Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={theme.textPrim} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Agent</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={100}
          keyboardOpeningTime={0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
        >

          {/* Emoji Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.emojiBox}
              onPress={() => setShowEmojiPicker(true)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#312E81", "#4F46E5"]}
                style={styles.emojiGradient}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
                <View style={styles.editIcon}>
                  <Sparkles size={14} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.avatarHelpText}>Tap to choose an icon</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="e.g., Coding Wizard"
              placeholderTextColor={theme.textSec}
              style={styles.input}
              value={agentName}
              onChangeText={setAgentName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instructions</Text>
            <Text style={styles.subLabel}>Describe how this agent should behave.</Text>
            <TextInput
              placeholder="e.g., You are an expert Python developer. Always provide code examples..."
              placeholderTextColor={theme.textSec}
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity onPress={CreateNewAgent} activeOpacity={0.8} style={styles.createBtnWrapper}>
            <LinearGradient
              colors={[theme.accent, "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtn}
            >
              <Text style={styles.createBtnText}>Create Agent</Text>
            </LinearGradient>
          </TouchableOpacity>

        </KeyboardAwareScrollView>

        {/* Emoji Modal */}
        <Modal
          visible={showEmojiPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose an Icon</Text>
                <TouchableOpacity onPress={() => setShowEmojiPicker(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.emojiGrid}>
                {emojiList.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiItem}
                    onPress={() => {
                      setEmoji(item);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={styles.emojiPickerText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
    backgroundColor: theme.cardBorder,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrim,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emojiBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 10,
    shadowColor: theme.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    marginBottom: 12,
  },
  emojiGradient: {
    flex: 1,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.cardBorder,
  },
  emojiText: {
    fontSize: 48
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.accent,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.background[0],
  },
  avatarHelpText: {
    color: theme.textSec,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.textPrim,
    marginBottom: 8
  },
  subLabel: {
    fontSize: 13,
    color: theme.textSec,
    marginBottom: 10,
    marginTop: -4,
  },
  input: {
    backgroundColor: theme.cardBg,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: theme.textPrim,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  textArea: {
    backgroundColor: theme.cardBg,
    padding: 16,
    borderRadius: 16,
    height: 140,
    fontSize: 16,
    lineHeight: 24,
    color: theme.textPrim,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  createBtnWrapper: {
    marginTop: 20,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  createBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  createBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: theme.textPrim,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: 'center',
  },
  emojiItem: {
    width: "16%",
    alignItems: "center",
    paddingVertical: 12
  },
  emojiPickerText: {
    fontSize: 32
  },
});
