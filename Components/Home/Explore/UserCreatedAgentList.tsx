import ArrowRight from "@/assets/icons/ArrowRight";
import { firestoreDb } from "@/config/Firebaseconfig";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/ThemeContext";

type Agent = {
  agentName: string;
  agentId: string;
  prompt: string;
  emoji: string;
};

export default function UserCreatedAgentList() {
  const { user } = useUser();
  const { theme } = useTheme();
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(firestoreDb, "agents"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Agent[] = [];
      snapshot.forEach((doc) => {
        list.push({
          ...(doc.data() as Agent),
          agentId: doc.id,
        });
      });
      setAgentList(list);
      setLoading(false);
    }, (error) => {
      console.log("Error fetching agents:", error);
      setLoading(false);
    },
    );

    return () => unsubscribe();
  }, [user]);

  const onDeleteAgent = (agent: Agent) => {
    Alert.alert(
      "Delete Agent",
      `Are you sure you want to delete "${agent.agentName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestoreDb, "agents", agent.agentId));
              // No need to manually refresh, onSnapshot handles it!
            } catch (error) {
              console.log("Delete error:", error);
              Alert.alert("Error", "Failed to delete agent. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={[styles.title, { color: theme.textPrim }]}>My Agents / Assistants</Text>

      <FlatList
        data={agentList}
        keyExtractor={(item) => item.agentId}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  agentName: item.agentName,
                  initialText: "",
                  agentPrompt: item.prompt,
                  agentId: item.agentId,
                },
              })
            }
          >
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.agentName, { color: theme.textPrim }]}>{item.agentName}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDeleteAgent(item);
                }}
                style={styles.deleteBtn}
              >
                <Trash2 size={20} color={theme.danger} />
              </TouchableOpacity>
              <ArrowRight width={20} height={20} color={theme.textSec} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  emoji: {
    fontSize: 28,
  },

  agentName: {
    fontSize: 18,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  deleteBtn: {
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  }
});
