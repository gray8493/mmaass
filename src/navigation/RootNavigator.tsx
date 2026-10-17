import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

/**
 * Điều hướng gốc (auth-aware): hiển thị màn hình đăng nhập/đăng ký khi
 * người dùng chưa đăng nhập, và toàn bộ ứng dụng (tabs + ngăn xếp) khi đã
 * đăng nhập. Nhờ đó các màn hình Home, Teams, Chat... luôn được bảo vệ.
 */
export const RootNavigator: React.FC = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>📋</Text>
        <Text style={styles.title}>TaskFlow Manager</Text>
        <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
        <Text style={styles.subtitle}>Đang kiểm tra phiên đăng nhập...</Text>
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },
});
