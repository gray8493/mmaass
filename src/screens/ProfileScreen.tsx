import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform } from 'react-native';

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Hồ sơ cá nhân (Profile)</Text>
          <Text style={styles.headerSubtitle}>Tài khoản và thông tin người dùng</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>EX</Text>
            </View>
            <Text style={styles.userName}>Chế độ Khách (Guest Mode)</Text>
            <Text style={styles.roleBadge}>No Authentication (Exam 1)</Text>
            <Text style={styles.description}>
              Hệ thống xác thực và đăng nhập (Firebase Authentication) sẽ được triển khai
              ở phần thi tiếp theo.
            </Text>

            <View style={styles.configSummary}>
              <Text style={styles.configTitle}>Thông tin ứng dụng:</Text>
              <Text style={styles.configItem}>
                • Framework: React Native (Expo SDK 57)
              </Text>
              <Text style={styles.configItem}>• Cơ sở dữ liệu: Cloud Firestore</Text>
              <Text style={styles.configItem}>
                • Trạng thái đồng bộ: Real-time Listener
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  configSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  configTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  configItem: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
