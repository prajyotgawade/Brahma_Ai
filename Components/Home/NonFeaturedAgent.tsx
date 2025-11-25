import React from "react";
import { Image, Text, View } from "react-native";
import { agent } from "../Home/AgentCard";

type Props = {
  agent: agent;
};

export default function NonFeaturedAgent({ agent }: Props) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 15,
        minHeight: 200,
        overflow: "hidden",
        padding: 15,
      }}
    >
         <View style={{  }}>
        <Image
          source={agent.image}
          style={{ width: 70, height: 70, resizeMode: "contain" }}
        />
      </View>

      <View style={{ 
        marginTop:10,
      }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          {agent.name}
        </Text>

        <Text numberOfLines={2} style={{ color: "gray", marginTop: 2 }}>
          {agent.desc}
        </Text>
      </View>

    </View>
  );
}
