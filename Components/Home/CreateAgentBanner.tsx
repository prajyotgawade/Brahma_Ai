import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

type Props = {
  onPress?: () => void;
};

export default function CreateAgentBanner({ onPress }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/create-agent" as any);
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(200).duration(800)}>
      <LinearGradient
        colors={["#312E81", "#4338CA", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.glassOverlay} />

        <View style={styles.contentContainer}>
          <Image
            source={require("../../assets/images/Agent_img/agentGroup.png")}
            style={styles.image}
          />

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Build Your Own AI
            </Text>
            <Text style={styles.subtitle}>
              Design a custom agent to help with your specific tasks.
            </Text>

            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F59E0B", "#EA580C"]} // Amber to Orange
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  Create Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginVertical: 16,
    elevation: 10,
    shadowColor: "#4338CA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  contentContainer: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#E0E7FF",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    opacity: 0.9,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

