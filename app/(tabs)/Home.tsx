import CreateAgentBanner from "@/Components/Home/CreateAgentBanner";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AgentListComponent from "../../Components/Home/AgentListComponent";

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();

  // Hide the default header
  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSettingsPress = () => {
    router.push("/Profile");
  };

  const handleProPress = () => {
    router.push("/Pro");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />

      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>

          {/* Pro Badge */}
          <TouchableOpacity style={styles.proBadge} onPress={handleProPress}>
            <Image
              source={require("../../assets/images/diamond.png")}
              style={styles.proIcon}
            />
            <Text style={styles.proText}>Pro</Text>
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Brahma AI</Text>
            <Text style={styles.headerSubtitle}>Your AI Agent</Text>
          </View>

          {/* Settings Button */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/images/settings.png")}
              style={styles.settingsIcon}
            />
          </TouchableOpacity>

        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AgentListComponent type="featured" />

        <CreateAgentBanner onPress={() => navigation.navigate("CreateAgentScreen" as never)} />

        <AgentListComponent type="nonfeatured" />
      </ScrollView>
    </View>
  );
}

const HEADER_HEIGHT = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop:
      HEADER_HEIGHT -
      (Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 24) -
      12,
    paddingBottom: 140,
    paddingHorizontal: 16,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4F46E5",
    paddingTop: 35,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0E0FF",
    marginTop: 2,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proIcon: { width: 18, height: 18, marginRight: 6 },
  proText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1F1F1F",
  },
  settingsButton: {
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIcon: {
    width: 22,
    height: 22,
  },
});
