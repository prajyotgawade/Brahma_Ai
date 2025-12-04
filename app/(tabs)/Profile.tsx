import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Clock, Compass, LogOut, PlusCircle } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AppRoutes = "/create-agent" | "/(tabs)/Explore" | "/(tabs)/History";

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  path?: AppRoutes;
};

const menuItems: MenuItem[] = [
  { title: "Create Agent", icon: <PlusCircle size={22} color="#4F46E5" />, path: "/create-agent" },
  { title: "Explore", icon: <Compass size={22} color="#4F46E5" />, path: "/(tabs)/Explore" },
  { title: "My History", icon: <Clock size={22} color="#4F46E5" />, path: "/(tabs)/History" },
  { title: "Logout", icon: <LogOut size={22} color="#FF4C4C" /> },
];

export default function ProfileScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const OnMenuClick = async (item: MenuItem) => {
    if (item.title === "Logout") {
      await signOut();
      router.replace("/");
      return;
    }

    if (item.path) {
      //@ts-ignore
      router.push(item.path);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.profileWrapper}>
          <Image
            source={{ uri: user?.imageUrl as string }}
            style={styles.profileImage}
          />
          <Text style={styles.emailText}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* MENU CARD */}
      <View style={styles.card}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => OnMenuClick(item)}
          >
            {item.icon}
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  header: {
    backgroundColor: "#6D4BFF",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 35,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 18,
  },

  profileWrapper: {
    alignItems: "center",
  },

  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 10,
  },

  emailText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#222",
    fontWeight: "600",
  },
});