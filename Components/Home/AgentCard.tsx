import React from "react";
import { Image, Text, View } from "react-native";
import { useTheme } from "../../shared/ThemeContext";

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
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 18,
        padding: 16,
        minHeight: 210,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme.cardBorder,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", color: theme.textPrim }}>
        {agent.name}
      </Text>

      <Text
        numberOfLines={2}
        style={{ color: theme.textSec, marginTop: 6, fontSize: 14 }}
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
