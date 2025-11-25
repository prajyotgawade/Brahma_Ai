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
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Brahma AI</Text>
      ),
      headerTitleAlign: "center",

      // LEFT PRO BUTTON
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

      // RIGHT SETTINGS BUTTON
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
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 15 }}>
        {/* Featured Agent Cards */}
        <AgentListComponent isFeatured={true} />

        {/* Full Width Banner */}
        <CreateAgentBanner
         // onPress={() => navigation.navigate("CreateAgentScreen")}
        />

        {/* Non Featured Agent Cards */}
        <AgentListComponent isFeatured={false} />
      </View>
    </ScrollView>
  );
}
