import { firestoreDb } from "@/config/Firebaseconfig";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { doc, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    <LinearGradient colors={["#A770EF", "#5C2DE8", "#2563EB"]} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/Robot.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to Brahma AI</Text>

        <Text style={styles.subtitle}>
          Your Ultimate AI Personal Agent to make life easier. Try it Today, Completely Free!
        </Text>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", width: "90%" },
  image: { width: 420, height: 320, marginBottom: 10 },
  title: { fontSize: 30, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#E5E7EB", marginBottom: 35, marginTop: 10 },
  button: { width: "85%", backgroundColor: "#FFFFFF", paddingVertical: 15, borderRadius: 14 },
  buttonText: { textAlign: "center", color: "#2563EB", fontSize: 18, fontWeight: "700" },
});
