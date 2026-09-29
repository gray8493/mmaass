import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform } from 'react-native';

export const TeamsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👥 Nhóm & Cộng tác (Teams)</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý thành viên và phân bổ công việc
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.icon}>🚀</Text>
            <Text style={styles.title}>Tính năng đang phát triển</Text>
            <Text style={styles.badge}>Coming soon</Text>
            <Text style={styles.description}>
              Phần quản lý Nhóm (Teams) và phân công thành viên (Assignee) sẽ được xây
              dựng trong bài thi kế tiếp (Practical Exam 2).
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📌 Dữ liệu Firestore đã được thiết kế sẵn các trường{' '}
                <Text style={styles.codeText}>teamId</Text> và{' '}
                <Text style={styles.codeText}>assigneeId</Text> sẵn sàng kết nối.
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
  icon: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
