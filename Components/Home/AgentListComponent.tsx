import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Agents } from "../../shared/AgentList";
import AgentCard from "./AgentCard";
import NonFeaturedAgent from "./NonFeaturedAgent";

type Props = {
  type: string; // "featured" | "nonfeatured"
};

export default function AgentListComponent({ type }: Props) {
  const router = useRouter();
  const { user } = useUser();

  // Memoize the filtered list so it does not re-calc every render
  const filteredAgents = useMemo(() => {
    return type === "featured"
      ? Agents.filter((a) => a.featured)
      : Agents.filter((a) => !a.featured);
  }, [type]);

  const handleOpenChat = (item: any) => {
    const email = user?.primaryEmailAddress?.emailAddress ?? "guest";

    // 🔥 fix: create stable chat id
    const chatId = `${email}_${item.id}`;

    router.push({
      pathname: "/chat",
      params: {
        agentName: item.name,
        initialText: item.initialText,
        agentPrompt: item.prompt,
        agentId: item.id,
        chatId: chatId,
        lastModified: Date.now()
        // 👈 important
      },
    });
  };

  return (
    <FlatList
      data={filteredAgents}
      numColumns={2}
      scrollEnabled={false}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ width: "48%", marginBottom: 14 }}
          onPress={() => handleOpenChat(item)}
        >
          {type === "featured" ? (
            <AgentCard agent={item} />
          ) : (
            <NonFeaturedAgent agent={item} />
          )}
        </TouchableOpacity>
      )}
    />
  );
}
