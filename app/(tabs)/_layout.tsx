import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // if gesture navigation is enabled -> positive inset, else -> 0
  const bottomSpacing = insets.bottom > 0 ? insets.bottom + 10 : 20;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#5C2DE8",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          position: "absolute",
          bottom: bottomSpacing,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 28,
          backgroundColor: "#FFFFFF",
          paddingBottom: Platform.OS === "ios" ? 12 : 8,
          paddingTop: 10,

          // shadow / elevation
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size + 6} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Explore"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size + 6} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="History"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size + 6} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size + 6} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
