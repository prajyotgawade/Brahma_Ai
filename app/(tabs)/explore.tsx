import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import AgentListComponent from "@/Components/Home/AgentListComponent";
import CreateAgentBanner from "@/Components/Home/CreateAgentBanner";
import UserCreatedAgentList from "@/Components/Home/Explore/UserCreatedAgentList";

export default function Explore() {
  const scrollY = new Animated.Value(0);

  return (
    <Animated.ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >
      {/* Top Title */}
      <Animated.Text
        style={[
          styles.headerTitle,
          {
            marginTop:20,
            opacity: scrollY.interpolate({
              inputRange: [0, 40],
              outputRange: [1, 0.2],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 40],
                  outputRange: [0, -8],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        Explore
      </Animated.Text>

      {/* Create Agent Banner */}
      <View style={styles.bannerWrapper}>
        <CreateAgentBanner />
      </View>

      {/* Your Agents List (without the text) */}
      <UserCreatedAgentList />

      {/* Featured Agents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Agents</Text>
        <AgentListComponent isFeatured={true} />
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10, // reduced gap
  },

  bannerWrapper: {
    marginBottom: 16, // spacing between header and banner
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 14,
  },
});
