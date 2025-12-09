import { firestoreDb } from "@/config/Firebaseconfig";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { MessageCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../shared/ThemeContext";

export default function History() {
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) GetChatHistory();
  }, [user]);

  const GetChatHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(firestoreDb, "conversations"),
        where("userEmail", "==", user?.primaryEmailAddress?.emailAddress ?? ""),
        orderBy("lastModified", "desc")
      );

      const res = await getDocs(q);
      const list: any[] = [];
      res.forEach((doc) => {
        let data: any = doc.data();
        if (!data.lastModified) {
          data.lastModified = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
        }
        list.push({ id: doc.id, ...data });
      });

      list.sort((a, b) => b.lastModified - a.lastModified);
      setHistoryList(list);
    } catch (error: any) {
      console.log("History Error", error);
    }
    setLoading(false);
  };

  const OnClickHandle = (item: any) => {
    router.push({
      pathname: "/chat",
      params: {
        agentName: item.agentName,
        agentPrompt: item.agentPrompt,
        agentId: item.agentId,
        chatId: item.id,
        messageList: JSON.stringify(item.messages),
        initialText: "",
      },
    });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, 150 * index, 150 * (index + 2)],
      outputRange: [1, 1, 1, 0],
    });

    const lastMessage = item.messages?.[item.messages.length - 1];
    let icon = <MessageCircle size={28} color={theme.textPrim} />;

    if (item.emoji) icon = <Text style={{ fontSize: 22 }}>{item.emoji}</Text>;
    else if (lastMessage?.emoji) icon = <Text style={{ fontSize: 22 }}>{lastMessage.emoji}</Text>;

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={() => OnClickHandle(item)}
          style={{
            flexDirection: "row",
            padding: 15,
            backgroundColor: theme.cardBg,
            marginBottom: 12,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: theme.cardBorder,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 15,
            }}
          >
            {icon}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: theme.textPrim }}>{item.agentName}</Text>
            <Text numberOfLines={2} style={{ fontSize: 14, color: theme.textSec, marginTop: 4 }}>
              {lastMessage?.content?.[0]?.text ?? "No messages"}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 70;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background[0] }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 40,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: theme.background[1],
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          borderTopWidth: 0,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "700", color: theme.textPrim }}>Chat History</Text>
        <Text style={{ fontSize: 14, color: theme.textSec, marginTop: 4 }}>Your recent conversations</Text>
      </View>

      {/* Chat List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Animated.FlatList
            data={historyList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{
              padding: 20,
              paddingTop: 15,
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20, // <-- add safe area + tab height
            }}
            showsVerticalScrollIndicator={true}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: false,
            })}
            scrollEventThrottle={16}
            refreshing={loading}
            onRefresh={GetChatHistory}
          />
        </View>
      )}
    </View>
  );
}
