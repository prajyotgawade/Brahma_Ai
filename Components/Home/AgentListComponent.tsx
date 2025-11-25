import { Agents } from "@/app/shared/AgentList";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AgentCard from "../Home/AgentCard";
import NonFeaturedAgent from "./NonFeaturedAgent";

export default function AgentListComponent({ isFeatured }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={Agents}
        numColumns={2}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          return (
            <View style={{ flex: 1, padding: 5 }}>
              {item.featured === isFeatured ? (
                <AgentCard agent={item} />
              ) : (
                <NonFeaturedAgent agent={item} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
});
