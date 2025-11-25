import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

const initialMessages = [
  { role: 'user', text: 'hii there!' },
  { role: 'assistant', text: 'hello! how can i help you today?' }
];

export default function ChatUI() {
  const navigation = useNavigation();
  const { agentName, agentPrompt, agentId, initialText } = useLocalSearchParams();
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: agentName,
      headerRight: () => <Plus />
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ padding: 10 }}>
            {item.role}: {item.text}
          </Text>
        )}
      />
    </View>
  );
}
