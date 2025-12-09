import * as Haptics from "expo-haptics";
import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "dark" | "light";

interface ThemeColors {
    background: string | readonly [string, string, ...string[]];
    textPrim: string;
    textSec: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    success: string;
    danger: string;
    menuItemBg: string;
}

const COLORS: Record<ThemeMode, ThemeColors> = {
    dark: {
        background: ["#0F172A", "#1E1B4B"],
        textPrim: "#F8FAFC",
        textSec: "#94A3B8",
        cardBg: "#1E293B",
        cardBorder: "rgba(255, 255, 255, 0.05)",
        accent: "#A855F7",
        success: "#4ADE80",
        danger: "#EF4444",
        menuItemBg: "transparent",
    },
    light: {
        background: ["#F8FAFC", "#E0E7FF"],
        textPrim: "#0F172A",
        textSec: "#475569",
        cardBg: "#FFFFFF",
        cardBorder: "rgba(99, 102, 241, 0.1)",
        accent: "#6366F1",
        success: "#16A34A",
        danger: "#DC2626",
        menuItemBg: "transparent",
    },
};

interface ThemeContextType {
    themeMode: ThemeMode;
    toggleTheme: () => void;
    theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");

    const toggleTheme = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const theme = COLORS[themeMode];

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
