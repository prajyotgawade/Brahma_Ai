import ArrowRight from "@/assets/icons/ArrowRight";
import { firestoreDb } from "@/config/Firebaseconfig";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Agent = {
  agentName: string;
  agentId: string;
  propmt: string;
  emoji: string;
};

export default function UserCreatedAgentList() {
  const { user } = useUser();
  const [agentList, setAgentList] = useState<Agent[]>([]);

  useEffect(() => {
    if (user) GetUserAgents();
  }, [user]);

  const GetUserAgents = async () => {
    try {
      const q = query(
        collection(firestoreDb, "agents"),
        where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
      );

      const querySnapshot = await getDocs(q);

      const list: Agent[] = [];
      querySnapshot.forEach((doc) => {
        list.push({
          ...(doc.data() as Agent),
          agentId: doc.id,
        });
      });

      setAgentList(list);
    } catch (e) {
      console.log("Error fetching agents:", e);
    }
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.title}>My Agents / Assistants</Text>

      <FlatList
        data={agentList}
        keyExtractor={(item) => item.agentId}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  agentName: item.agentName,
                  initialText: "",
                  agentPrompt: item.propmt,
                  agentId: item.agentId,
                },
              })
            }
          >
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.agentName}>{item.agentName}</Text>
            </View>

            <ArrowRight width={20} height={20} color="#333" />
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
    color: "#1A1A1A",
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
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
    color: "#111",
  },
});
