import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, Check, Crown, Shield, Zap } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./shared/ThemeContext";

export default function ProScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const url =
        billingCycle === "monthly"
          ? process.env.EXPO_PUBLIC_RAZORPAY_MONTHLY_URL
          : process.env.EXPO_PUBLIC_RAZORPAY_YEARLY_URL;

      if (!url) {
        Alert.alert("Configuration Error", "Payment URL not found.");
        return;
      }

      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert("Error", "Could not open payment page.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Zap size={20} color="#F59E0B" />, text: "Unlimited AI Interactions" },
    { icon: <Crown size={20} color="#F59E0B" />, text: "Access to Premium Agents" },
    { icon: <Shield size={20} color="#F59E0B" />, text: "Priority Support & Security" },
    { icon: <Check size={20} color="#F59E0B" />, text: "Early Access to New Features" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={themeMode === "dark" ? ["#1E1B4B", "#0F172A"] : ["#EEF2FF", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.cardBorder }]}
        >
          <ArrowLeft color={theme.textPrim} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.heroContainer}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#6366F1", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Crown size={48} color="#FFF" />
            </LinearGradient>
            <View style={[styles.glow, { shadowColor: theme.accent }]} />
          </View>
          <Text style={[styles.title, { color: theme.textPrim }]}>Upgrade to Pro</Text>
          <Text style={[styles.subtitle, { color: theme.textSec }]}>
            Break limits. Unlock the full potential.
          </Text>
        </Animated.View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(300 + index * 100).springify()}
              style={[styles.featureRow, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.cardBorder }]}>
                {feature.icon}
              </View>
              <Text style={[styles.featureText, { color: theme.textPrim }]}>{feature.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Billing Toggle */}
        <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              billingCycle === "monthly" && { backgroundColor: theme.cardBg, borderColor: theme.accent, borderWidth: 1 }
            ]}
            onPress={() => setBillingCycle("monthly")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: billingCycle === "monthly" ? theme.textPrim : theme.textSec }
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              billingCycle === "yearly" && { backgroundColor: theme.cardBg, borderColor: theme.accent, borderWidth: 1 }
            ]}
            onPress={() => setBillingCycle("yearly")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: billingCycle === "yearly" ? theme.textPrim : theme.textSec }
              ]}
            >
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>SAVE 20%</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Price Card */}
        <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.priceContainer}>
          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={[styles.priceCard, { borderColor: theme.cardBorder }]}
          >
            <Text style={styles.priceLabel}>
              {billingCycle === "monthly" ? "Monthly Plan" : "Yearly Plan"}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.priceAmount}>
                {billingCycle === "monthly" ? "199" : "1999"}
              </Text>
              <Text style={styles.pricePeriod}>
                /{billingCycle === "monthly" ? "mo" : "yr"}
              </Text>
            </View>
            <Text style={styles.priceSub}>
              {billingCycle === "monthly" ? "Cancel anytime" : "Best value for power users"}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Subscribe Button */}
        <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.footer}>
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.8}
            style={styles.subscribeBtnWrapper}
            disabled={loading}
          >
            <LinearGradient
              colors={["#6366F1", "#A855F7", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeBtn}
            >
              <Text style={styles.subscribeBtnText}>
                {loading ? "Processing..." : billingCycle === "monthly" ? "Start Monthly Subscription" : "Start Yearly Subscription"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.disclaimer, { color: theme.textSec }]}>
            Recurring billing. Cancel anytime.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 4,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 14,
  },
  saveBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  saveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  priceContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  priceCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  priceLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  currencySymbol: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 6,
    marginRight: 2,
  },
  priceAmount: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
  },
  pricePeriod: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  priceSub: {
    color: "#CBD5E1",
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  subscribeBtnWrapper: {
    width: "100%",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  subscribeBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  subscribeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: 12,
  },
});
