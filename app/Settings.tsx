import { useRouter } from "expo-router";
import { ArrowLeft, Moon, Sun } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../shared/ThemeContext";

export default function SettingsScreen() {
    const router = useRouter();
    const { theme, toggleTheme, themeMode } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
            <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 10,
                    backgroundColor: theme.background[1],
                    borderColor: theme.cardBorder
                }
            ]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.cardBorder }]}>
                    <ArrowLeft color={theme.textPrim} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrim }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSec }]}>APPEARANCE</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: theme.background[0] }]}>
                                    {themeMode === "dark" ? (
                                        <Moon size={20} color={theme.accent} />
                                    ) : (
                                        <Sun size={20} color={theme.accent} />
                                    )}
                                </View>
                                <Text style={[styles.rowLabel, { color: theme.textPrim }]}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={themeMode === "dark"}
                                onValueChange={toggleTheme}
                                trackColor={{ false: "#767577", true: theme.accent }}
                                thumbColor="#f4f3f4"
                            />
                        </View>
                    </View>
                </View>

                {/* About App (Placeholder) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSec }]}>ABOUT</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.rowLabel, { color: theme.textPrim }]}>Version</Text>
                            <Text style={[styles.rowValue, { color: theme.textSec }]}>1.0.0</Text>
                        </View>
                    </View>
                </View>

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
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowValue: {
        fontSize: 15,
    }
});
