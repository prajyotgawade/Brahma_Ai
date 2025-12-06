import { firestoreDb } from "@/config/Firebaseconfig";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { doc, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "./shared/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

function useWarmBrowser() {
  useEffect(() => {
    if (Platform.OS === "android") WebBrowser.warmUpAsync();
    return () => {
      if (Platform.OS === "android") WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function Index() {
  useWarmBrowser();
  const router = useRouter();
  const { theme } = useTheme();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user, isSignedIn } = useUser();

  // Start OAuth login
  const onPress = useCallback(async () => {
    if (isSignedIn) {
      router.replace("/(tabs)/Home"); // already logged in
      return;
    }

    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: AuthSession.makeRedirectUri({ scheme: "myapp" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth ERROR:", err);
    }
  }, [isSignedIn]);

  // Firestore write: wait until user info is available
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      const saveUser = async () => {
        const userRef = doc(firestoreDb, "users", email);
        await setDoc(
          userRef,
          {
            email,
            name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
            joinDate: Date.now(),
            credit: 20,
          },
          { merge: true }
        );
      };
      saveUser().then(() => router.replace("/(tabs)/Home")); // navigate after saving
    }
  }, [user]);

  return (
    <LinearGradient colors={theme.background} style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()}>
          <Image
            source={require("../assets/images/Robot.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()}>
          <Text style={[styles.title, { color: theme.textPrim }]}>Welcome to <Text style={[styles.highlight, { color: theme.accent }]}>Brahma AI</Text></Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
          <Text style={[styles.subtitle, { color: theme.textSec }]}>
            Your Ultimate AI Personal Agent to make life easier. Try it Today, Completely Free!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(1000).springify()} style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonShadow} onPress={onPress}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", width: "90%" },
  image: { width: 380, height: 380, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", textAlign: "center", letterSpacing: 0.5 },
  highlight: {}, // Color handled dynamically
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 40, marginTop: 10, lineHeight: 24, paddingHorizontal: 10 },
  buttonContainer: { width: "100%", alignItems: 'center' },
  buttonShadow: {
    width: "85%",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
    borderRadius: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { textAlign: "center", color: "#FFFFFF", fontSize: 18, fontWeight: "800", letterSpacing: 1 },
});
