import React from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../shared/ThemeContext";

import AgentListComponent from "@/Components/Home/AgentListComponent";
import CreateAgentBanner from "@/Components/Home/CreateAgentBanner";
import UserCreatedAgentList from "@/Components/Home/Explore/UserCreatedAgentList";

export default function Explore() {
  const scrollY = new Animated.Value(0);
  const { theme, themeMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background[0] }}>
      <StatusBar
        backgroundColor={theme.background[1]}
        barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
      />

      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: theme.background[1], borderColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrim }]}>Explore</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSec }]}>Discover featured and new agents</Text>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "ios" ? 40 : (StatusBar.currentHeight || 24) + 20,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Create Agent Banner */}
        <View style={{ marginBottom: 10, marginTop: -30 }}>
          <CreateAgentBanner />
        </View>

        {/* User Created Agents List */}
        <UserCreatedAgentList />

        {/* Featured Agents */}
        <View style={{ marginTop: 25 }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrim }]}>Featured Agents</Text>
          <AgentListComponent type="featured" />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  headerTitle: { fontSize: 26, fontWeight: "700" },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 14 },
});
