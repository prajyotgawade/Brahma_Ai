import { Agents } from "@/app/shared/AgentList";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import AgentCard from "./AgentCard";
import NonFeaturedAgent from "./NonFeaturedAgent";

export default function AgentListComponent({ type }: { type: string }) {
  const router = useRouter();

  const filteredAgents =
    type === "featured"
      ? Agents.filter((a) => a.featured)
      : Agents.filter((a) => !a.featured);

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
          onPress={() =>
            router.push({
              pathname: "/chat",
              params: {
                agentName: item.name,
                initialText: item.initialText,
                agentPrompt: item.prompt,
                agentId: item.id,
              },
            })
          }
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
