import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function CreateAgentBanner() {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "#6D4AFF",
        borderRadius: 24,
        padding: 20,
        marginVertical: 20,
        flexDirection: "row",
        alignItems: "center",
        elevation: 6,
      }}
    >
      <Image
        source={require("../../assets/images/Agent_img/agentGroup.png")}
        style={{ width: 120, height: 120, resizeMode: "contain" }}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
          Create Your Own Agent
        </Text>

        <Text style={{ color: "#e8e8e8", marginTop: 4, fontSize: 14 }}>
          Customize your personal AI assistant
        </Text>

        <TouchableOpacity
          style={{
            marginTop: 14,
            backgroundColor: "white",
            paddingVertical: 10,
            borderRadius: 14,
            alignSelf: "flex-start",
            paddingHorizontal: 26,
          }}
          onPress={() => router.push("/create-agent")}
        >
          <Text style={{ color: "#6D4AFF", fontSize: 16, fontWeight: "700" }}>
            Create
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
