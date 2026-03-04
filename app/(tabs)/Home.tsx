import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AgentListComponent from "../../Components/Home/AgentListComponent";
import CreateAgentBanner from "../../Components/Home/CreateAgentBanner";
import { useTheme } from "../../shared/ThemeContext";

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <StatusBar backgroundColor={theme.background[1]} barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />

      {/* Fixed Header */}
      <View style={[
        styles.headerWrapper,
        { paddingTop: insets.top + 10, backgroundColor: theme.background[1], borderColor: theme.cardBorder }
      ]}>
        <View style={styles.headerRow}>

          {/* Pro Badge */}
          <TouchableOpacity onPress={handleProPress}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              style={styles.proBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={require("../../assets/images/diamond.png")}
                style={styles.proIcon}
              />
              <Text style={styles.proText}>Pro</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <View style={styles.headerCenter} pointerEvents="none">
            <Text style={[styles.headerTitle, { color: theme.textPrim }]}>Brahma AI</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSec }]}>Your AI Agent</Text>
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: theme.cardBg }]}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/images/settings.png")}
              style={[styles.settingsIcon, { tintColor: theme.textPrim }]}
            />
          </TouchableOpacity>

        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 80,
            paddingBottom: 100 + insets.bottom
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AgentListComponent type="featured" />

        <CreateAgentBanner />

        <AgentListComponent type="nonfeatured" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    borderWidth: 1,
    borderTopWidth: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  proIcon: { width: 18, height: 18, marginRight: 6 },
  proText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#FFFFFF",
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
  },
  settingsIcon: {
    width: 22,
    height: 22,
  },
});
