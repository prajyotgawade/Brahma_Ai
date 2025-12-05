import React from "react";
import { Image, Text, View } from "react-native";

export type agent = {
  id: number;
  name: string;
  desc: string;
  image: any;
  initialText: string;
  prompt: string;
  type: string;
  featured?: boolean;
};

export default function AgentCard({ agent }: { agent: agent }) {
  return (
    <View
      style={{
        backgroundColor: "#1E293B",
        borderRadius: 18,
        padding: 16,
        minHeight: 210,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#F8FAFC" }}>
        {agent.name}
      </Text>

      <Text
        numberOfLines={2}
        style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}
      >
        {agent.desc}
      </Text>

      <Image
        source={agent.image}   // <-- FIXED (no fallback)
        style={{
          width: 90,
          height: 90,
          alignSelf: "center",
          resizeMode: "contain",
        }}
      />
    </View>
  );
}
