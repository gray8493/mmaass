import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { ChatScreen } from '../screens/ChatScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetailScreen}
        options={({ route }) => ({
          title: route.params?.teamName || 'Chi tiết nhóm',
        })}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: `💬 ${route.params.teamName}`,
        })}
      />
    </Stack.Navigator>
  );
};
