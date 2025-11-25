import React from "react";
import { Image, Text, View } from "react-native";

export type agent = {
  id: number;
  name: string;
  desc: string;
  image: any;
  initialText: string;   // <- FIX: match the Agents array casing
  prompt: string;
  type: string;
  featured?: boolean;
};

export type Props = {
  agent: agent;
};

export default function AgentCard({ agent }: Props) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        minHeight: 190,
        marginVertical: 10,
        paddingBottom: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Text Section */}
      <View
        style={{
          padding: 10,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {agent.name}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            color: "gray",
            marginTop: 1,
          }}
        >
          {agent.desc}
        </Text>
      </View>

      {/* Bottom-Right Positioned Image */}
      {agent.image && (
        <View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 90,
            height: 90,
          }}
        >
          <Image
            source={agent.image}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
            }}
          />
        </View>
      )}
    </View>
  );
}
