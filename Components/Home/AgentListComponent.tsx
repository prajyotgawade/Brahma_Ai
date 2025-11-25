import { Agents } from "@/app/shared/AgentList";
import React from "react";
import { FlatList, View } from "react-native";
import AgentCard from "./AgentCard";
import NonFeaturedAgent from "./NonFeaturedAgent";

export default function AgentListComponent({ type }: { type: string }) {
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
        <View style={{ width: "48%", marginBottom: 14 }}>
          {type === "featured" ? (
            <AgentCard agent={item} />
          ) : (
            <NonFeaturedAgent agent={item} />
          )}
        </View>
      )}
    />
  );
}
