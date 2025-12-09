import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Clock, Compass, LogOut, PlusCircle, Settings } from "lucide-react-native";
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
import { useTheme } from "../../shared/ThemeContext";

type AppRoutes = "/create-agent" | "/(tabs)/Explore" | "/(tabs)/History" | "/Settings";

type MenuItem = {
  title: string;
  icon: (color: string) => React.ReactNode;
  path?: AppRoutes;
  action?: string;
};

export default function ProfileScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();
  const { theme, themeMode } = useTheme();

  const menuItems: MenuItem[] = [
    { title: "Create Agent", icon: (c) => <PlusCircle size={22} color={c} />, path: "/create-agent" },
    { title: "Explore", icon: (c) => <Compass size={22} color={c} />, path: "/(tabs)/Explore" },
    { title: "My History", icon: (c) => <Clock size={22} color={c} />, path: "/(tabs)/History" },
    { title: "Settings", icon: (c) => <Settings size={22} color={c} />, path: "/Settings" },
    { title: "Logout", icon: (c) => <LogOut size={22} color={theme.danger} />, action: "logout" },
  ];

  const handleMenuClick = async (item: MenuItem) => {
    if (item.action === "logout") {
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.background[1], borderColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrim }]}>Profile</Text>

        <View style={styles.profileWrapper}>
          <Image
            source={{ uri: user?.imageUrl as string }}
            style={[styles.profileImage, { borderColor: theme.accent }]}
          />
          <Text style={[styles.emailText, { color: theme.textSec }]}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* MENU CARD */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              { borderBottomColor: theme.cardBorder },
              index === menuItems.length - 1 && { borderBottomWidth: 0 }
            ]}
            onPress={() => handleMenuClick(item)}
          >
            <View style={styles.menuItemLeft}>
              {item.icon(item.title === "Logout" ? theme.danger : theme.accent)}
              <Text style={[styles.menuText, { color: item.title === "Logout" ? theme.danger : theme.textPrim }]}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 35,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
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
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "600",
  },
});