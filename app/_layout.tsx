import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        {/* Add this line to hide header for tab navigation */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </ClerkProvider>
  );
}
