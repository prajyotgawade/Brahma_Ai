import CreateAgentBanner from "@/Components/Home/CreateAgentBanner";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AgentListComponent from "../../Components/Home/AgentListComponent";

export default function Home() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <Text style={{ fontWeight: "800", fontSize: 22, color: "#fff" }}>
          Brahma AI
        </Text>
      ),
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#6D4AFF",
      },

      headerLeft: () => (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ffd700",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 10,
          }}
        >
          <Image
            source={require("../../assets/images/diamond.png")}
            style={{ width: 18, height: 18, marginRight: 5 }}
          />
          <Text style={{ fontWeight: "700", fontSize: 16 }}>Pro</Text>
        </TouchableOpacity>
      ),

      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 12, padding: 6 }}>
          <Image
            source={require("../../assets/images/settings.png")}
            style={{ width: 22, height: 22 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#EEF2FF" }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <AgentListComponent type="featured" />

        <CreateAgentBanner
          onPress={() => navigation.navigate("CreateAgentScreen" as never)}
        />

        <AgentListComponent type="nonfeatured" />
      </View>
    </ScrollView>
  );
}
