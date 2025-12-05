import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function Pro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const features = [
    { icon: "infinite", text: "Unlimited AI Interactions" },
    { icon: "speedometer", text: "Fastest Response Speed" },
    { icon: "hardware-chip", text: "Access to GPT-4 & Advanced Models" },
    { icon: "cloud-upload", text: "Unlimited Cloud Storage" },
    { icon: "shield-checkmark", text: "Priority Support & Security" },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Simulate API call or Payment Gateway initiation
      // In a real app, this would fetch a Stripe Payment Intent or open a Checkout Session

      // Example: Open Stripe Checkout (Placeholder URL)
      // await WebBrowser.openBrowserAsync("https://buy.stripe.com/your-payment-link");

      // Simulating a delay for "Processing"
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Payment Gateway",
        "This would open your Stripe/Payment Provider checkout page.",
        [
          {
            text: "OK",
            onPress: () => router.back(), // Go back after 'success'
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Something went wrong with the payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#0F172A", "#1E1B4B", "#312E81"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#6366F1", "#A855F7"]}
              style={styles.iconGradient}
            >
              <Ionicons name="diamond" size={40} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>Unlock the full power of Brahma AI</Text>
        </Animated.View>

        {/* Benefits List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(200 + index * 100).duration(600)}
              style={styles.featureRow}
            >
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={16} color="#4ADE80" />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Pricing Plans */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "monthly" && styles.selectedPlanBorder,
            ]}
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.9}
          >
            <BlurView intensity={20} tint="light" style={styles.blurContainer}>
              <View style={styles.planContent}>
                <View>
                  <Text style={styles.planTitle}>Monthly</Text>
                  <Text style={styles.planPrice}>$9.99<Text style={styles.perUser}>/mo</Text></Text>
                </View>
                {selectedPlan === "monthly" && (
                  <Ionicons name="radio-button-on" size={24} color="#A855F7" />
                )}
                {selectedPlan !== "monthly" && (
                  <Ionicons name="radio-button-off" size={24} color="#94A3B8" />
                )}
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Yearly Plan - Best Value */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "yearly" && styles.selectedPlanBorder,
            ]}
            onPress={() => setSelectedPlan("yearly")}
            activeOpacity={0.9}
          >
            {/* Best Value Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>
            <BlurView intensity={selectedPlan === "yearly" ? 40 : 20} tint="light" style={styles.blurContainer}>
              <View style={styles.planContent}>
                <View>
                  <Text style={styles.planTitle}>Yearly</Text>
                  <Text style={styles.planPrice}>$99.99<Text style={styles.perUser}>/yr</Text></Text>
                  <Text style={styles.saveText}>Save 20%</Text>
                </View>
                {selectedPlan === "yearly" && (
                  <Ionicons name="radio-button-on" size={24} color="#A855F7" />
                )}
                {selectedPlan !== "yearly" && (
                  <Ionicons name="radio-button-off" size={24} color="#94A3B8" />
                )}
              </View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* Subscribe Button */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.footer}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <LinearGradient
              colors={["#6366F1", "#A855F7", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.subscribeText}>
                  {selectedPlan === "monthly" ? "Start Monthly Plan" : "Start Yearly Plan"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>Cancel anytime. Secure payment via Stripe.</Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#E2E8F0",
    fontWeight: "500",
  },
  plansContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
    gap: 16,
  },
  planCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  selectedPlanBorder: {
    borderColor: "#A855F7",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
  blurContainer: {
    padding: 20,
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
  },
  perUser: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  saveText: {
    color: "#4ADE80",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#A855F7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 16,
    zIndex: 10,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  footer: {
    paddingHorizontal: 24,
  },
  subscribeButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  disclaimer: {
    marginTop: 16,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
  },
});
