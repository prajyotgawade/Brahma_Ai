import React from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, View } from "react-native";

import AgentListComponent from "@/Components/Home/AgentListComponent";
import CreateAgentBanner from "@/Components/Home/CreateAgentBanner";
import UserCreatedAgentList from "@/Components/Home/Explore/UserCreatedAgentList";

export default function Explore() {
  const scrollY = new Animated.Value(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar
        backgroundColor="#1E1B4B"
        barStyle="light-content"
      />

      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover featured and new agents</Text>
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
          <Text style={styles.sectionTitle}>Featured Agents</Text>
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
    backgroundColor: "#1E1B4B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderTopWidth: 0,
  },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#F8FAFC" },
  headerSubtitle: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#F8FAFC", marginBottom: 14 },
});
