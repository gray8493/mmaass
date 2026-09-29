import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { TeamsScreen } from '../screens/TeamsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Teams: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size ? size - 2 : 20, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          tabBarLabel: 'Nhóm',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size ? size - 2 : 20, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size ? size - 2 : 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
