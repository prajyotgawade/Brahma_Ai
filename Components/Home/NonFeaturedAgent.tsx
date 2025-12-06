import React from "react";
import { Image, Text, View } from "react-native";
import { useTheme } from "../../app/shared/ThemeContext";
import { agent } from "./AgentCard";

export default function NonFeaturedAgent({ agent }: { agent: agent }) {
    const { theme } = useTheme();
    return (
        <View
            style={{
                backgroundColor: theme.cardBg,
                borderRadius: 18,
                padding: 16,
                minHeight: 210,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: theme.cardBorder,
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
                    color: theme.textPrim,
                }}
            >
                {agent.name}
            </Text>

            <Text
                numberOfLines={2}
                style={{
                    color: theme.textSec,
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
