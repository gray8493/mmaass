import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTeams } from '../hooks/useTeams';

const getInitials = (name: string, email: string): string => {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.substring(0, 2).toUpperCase();
};

export const ProfileScreen: React.FC = () => {
  const { user, signOut, updateAvatar } = useAuth();
  const { teams } = useTeams(user?.id ?? null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cho phép ứng dụng truy cập thư viện ảnh để chọn ảnh đại diện.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        setUploading(true);
        const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateAvatar(dataUrl);
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        'Không thể cập nhật ảnh đại diện. Vui lòng thử lại. ' + (error as Error).message
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn đăng xuất khỏi ứng dụng?')) {
        doLogout();
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi ứng dụng?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Hồ sơ cá nhân</Text>
          <Text style={styles.headerSubtitle}>Tài khoản và thông tin người dùng</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
              disabled={uploading}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getInitials(user.name, user.email)}
                  </Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                {uploading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.cameraBadgeText}>📷</Text>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user.name || 'Người dùng'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{teams.length}</Text>
                <Text style={styles.statLabel}>Nhóm</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>✓</Text>
                <Text style={styles.statLabel}>Email đã xác thực</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handlePickAvatar}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>
                {uploading ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnLogout}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.btnLogoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configSummary}>
            <Text style={styles.configTitle}>Thông tin ứng dụng:</Text>
            <Text style={styles.configItem}>• Framework: React Native (Expo SDK 57)</Text>
            <Text style={styles.configItem}>
              • Xác thực: Firebase Authentication (Email/Password)
            </Text>
            <Text style={styles.configItem}>
              • Cơ sở dữ liệu: Cloud Firestore + Realtime Listener
            </Text>
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
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarWrapper: {
    marginBottom: 14,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cameraBadgeText: {
    fontSize: 13,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSecondaryText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
  btnLogout: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  btnLogoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  configSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
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
