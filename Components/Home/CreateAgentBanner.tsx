import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onPress?: () => void;
};

export default function CreateAgentBanner({ onPress }: Props) {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#28A9FF",
        borderRadius: 18,
        padding: 15,
        marginVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      {/* Left Image */}
      <Image
        source={require("../../assets/images/Agent_img/agentGroup.png")}
        style={{
          width: 130,
          height: 130,
          resizeMode: "contain",
        }}
      />

      {/* Right Content */}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          Create Your Own Agent
        </Text>

        <Text style={{ color: "white", marginTop: 4 }}>
          Customize your personal AI assistant
        </Text>

        <TouchableOpacity
          onPress={onPress}
          style={{
            marginTop: 14,
            backgroundColor: "white",
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#007BFF",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Create
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
