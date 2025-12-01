import { firestoreDb } from '@/config/Firebaseconfig';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation, useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function CreateAgent() {
    const navigation = useNavigation();
    const router = useRouter();
    const { user } = useUser();

    const [emoji, setEmoji] = useState('🤖');
    const [agentName, setAgentName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Android-safe custom emoji list
    const emojiList = [
        "🤖", "🧠", "⚡", "🔥", "👨‍💻", "🦾", "💡", "📡", "🎯", "🛠️",
        "📘", "📁", "📱", "💎", "✨", "🚀", "🧩", "🤝", "📈", "🔍",
        "🔮", "🪄", "🎨", "🌐", "🔧", "📝"
    ];

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Create Agent",
        });
    }, []);

    // CREATE AGENT
    const CreateNewAgent = async () => {
        if (!agentName.trim() || !emoji.trim() || !instructions.trim()) {
            Alert.alert("Please fill all fields");
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
                createdAt: new Date().toISOString(),
            });

            Alert.alert("Confirmation", "Agent Created Successfully!", [
                { text: "OK", style: "cancel" },
                {
                    text: "Try Now",
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
            Alert.alert("Error", "Something went wrong!");
        }
    };

    return (
        <TouchableWithoutFeedback>
            <View style={{ flex: 1, backgroundColor: "#fff" }}>

                {/* KEYBOARD-AWARE SCROLLVIEW */}
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={80}
                    keyboardOpeningTime={0}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    <View style={styles.container}>

                        {/* Emoji selector button */}
                        <TouchableOpacity
                            style={styles.emojiBox}
                            onPress={() => setShowEmojiPicker(true)}
                        >
                            <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>

                        {/* Agent Name */}
                        <View style={styles.card}>
                            <Text style={styles.label}>Agent/Assistant Name</Text>
                            <TextInput
                                placeholder="Agent Name"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={agentName}
                                onChangeText={setAgentName}
                            />
                        </View>

                        {/* Instructions */}
                        <View style={styles.card}>
                            <Text style={styles.label}>Instruction</Text>
                            <TextInput
                                placeholder="Write instructions here…"
                                placeholderTextColor="#999"
                                style={styles.textArea}
                                multiline
                                value={instructions}
                                onChangeText={setInstructions}
                            />
                        </View>

                        {/* Create Button */}
                        <TouchableOpacity style={styles.createBtn} onPress={CreateNewAgent}>
                            <Text style={styles.createBtnText}>Create Agent</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>

                {/* Emoji Picker Modal */}
                <Modal
                    visible={showEmojiPicker}
                    animationType={Platform.OS === "android" ? "fade" : "slide"}
                >
                    <View style={{ flex: 1 }}>
                        <View style={styles.emojiHeader}>
                            <Text style={styles.emojiHeaderText}>Select Emoji</Text>
                            <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                                <Text style={styles.closeEmoji}>✖</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Custom emoji grid */}
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
                </Modal>

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },

    emojiBox: {
        alignSelf: "center",
        marginBottom: 25,
        backgroundColor: "#F1F1F1",
        padding: 22,
        borderRadius: 18,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },

    emojiText: { fontSize: 48 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },

    input: {
        backgroundColor: "#F7F7F7",
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        color: "#000",
    },

    textArea: {
        backgroundColor: "#F7F7F7",
        padding: 16,
        borderRadius: 14,
        height: 130,
        fontSize: 16,
        lineHeight: 22,
        color: "#000",
        textAlignVertical: "top",
    },

    createBtn: {
        backgroundColor: "#0A84FF",
        paddingVertical: 17,
        borderRadius: 16,
        marginTop: 25,
        elevation: 4,
    },

    createBtnText: {
        textAlign: "center",
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },

    emojiHeader: {
        padding: 16,
        backgroundColor: "#0A84FF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    emojiHeaderText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },

    closeEmoji: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },

    emojiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 20,
    },

    emojiItem: {
        width: "16.66%",
        alignItems: "center",
        paddingVertical: 12,
    },

    emojiPickerText: {
        fontSize: 34,
    },
});
