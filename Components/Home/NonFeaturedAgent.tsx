import React from "react";
import { Image, Text, View } from "react-native";
import { agent } from "./AgentCard";

export default function NonFeaturedAgent({ agent }: { agent: agent }) {
    return (
        <View
            style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 16,
                minHeight: 210,   // 🔥 fixed height same as AgentCard
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 3,
                justifyContent: "space-between",
            }}
        >
            <Image
                source={agent.image}
                style={{ width: 70, height: 70, alignSelf: "center", resizeMode: "contain" }}
            />

            <Text
                style={{
                    fontSize: 17,
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: 10,
                }}
            >
                {agent.name}
            </Text>

            <Text
                numberOfLines={2}
                style={{
                    color: "gray",
                    fontSize: 13,
                    textAlign: "center",
                    marginTop: 4,
                }}
            >
                {agent.desc}
            </Text>
        </View>

    );
}
