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
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 16,
        minHeight: 210, // fixed height for equal grid
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#222" }}>
        {agent.name}
      </Text>

      <Text
        numberOfLines={2}
        style={{ color: "#6e6e6e", marginTop: 6, fontSize: 14 }}
      >
        {agent.desc}
      </Text>

      <Image
        source={agent.image}
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