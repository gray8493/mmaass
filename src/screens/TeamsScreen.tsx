import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { createTeam, joinTeamByCode } from '../services/teamService';
import { Team } from '../types/team';
import { AppStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export const TeamsScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { teams, loading } = useTeams(user?.id ?? null);
  const [refreshing, setRefreshing] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerCode, setBannerCode] = useState('');

  if (!user) return null;

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setCreateError('Vui lòng nhập tên nhóm.');
      return;
    }
    try {
      setCreating(true);
      setCreateError('');
      const team = await createTeam(
        { name: teamName, description: teamDescription },
        user
      );
      setCreateVisible(false);
      setTeamName('');
      setTeamDescription('');
      setBannerCode(team.code);
      setBannerMessage(`Đã tạo nhóm "${team.name}" thành công!`);
    } catch (error) {
      setCreateError('Không thể tạo nhóm: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setJoinError('Vui lòng nhập mã nhóm.');
      return;
    }
    try {
      setJoining(true);
      setJoinError('');
      const team = await joinTeamByCode(joinCode, user);
      setJoinCode('');
      setBannerCode('');
      setBannerMessage(`Bạn đã tham gia nhóm "${team.name}".`);
    } catch (error) {
      setJoinError((error as Error).message);
    } finally {
      setJoining(false);
    }
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('TeamDetail', {
          teamId: item.id,
          teamName: item.name,
        })
      }
    >
      <View style={styles.teamAvatar}>
        <Text style={styles.teamAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.teamDescription} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.teamCode}>Mã nhóm: {item.code}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>👥 Nhóm của tôi</Text>
              <Text style={styles.headerSubtitle}>
                Tạo nhóm mới hoặc tham gia bằng mã nhóm
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnCreate}
              onPress={() => setCreateVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCreateText}>+ Tạo nhóm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {bannerMessage ? (
          <View style={styles.banner}>
            <View style={styles.bannerTextWrapper}>
              <Text style={styles.bannerText}>{bannerMessage}</Text>
              {bannerCode ? (
                <Text style={styles.bannerCode}>Mã nhóm: {bannerCode}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setBannerMessage('')}>
              <Text style={styles.bannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.joinCard}>
          <Text style={styles.joinTitle}>Tham gia nhóm</Text>
          <View style={styles.joinRow}>
            <TextInput
              style={styles.joinInput}
              placeholder="Nhập mã nhóm (VD: AB12CD)"
              placeholderTextColor="#94a3b8"
              value={joinCode}
              onChangeText={(text) => {
                setJoinCode(text.toUpperCase());
                if (joinError) setJoinError('');
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.btnJoin, joining && styles.btnDisabled]}
              onPress={handleJoin}
              disabled={joining}
              activeOpacity={0.8}
            >
              {joining ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.btnJoinText}>Tham gia</Text>
              )}
            </TouchableOpacity>
          </View>
          {joinError ? <Text style={styles.joinError}>⚠️ {joinError}</Text> : null}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải danh sách nhóm...</Text>
          </View>
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id}
            renderItem={renderTeam}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 600);
                }}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>Bạn chưa tham gia nhóm nào</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy tạo nhóm mới hoặc nhập mã nhóm để tham gia cùng đồng nghiệp.
                </Text>
              </View>
            }
          />
        )}

        <Modal
          visible={createVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCreateVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✨ Tạo nhóm mới</Text>
                <TouchableOpacity onPress={() => setCreateVisible(false)} hitSlop={10}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {createError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {createError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Tên nhóm <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Nhóm Marketing"
                  placeholderTextColor="#94a3b8"
                  value={teamName}
                  onChangeText={(text) => {
                    setTeamName(text);
                    if (createError) setCreateError('');
                  }}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mô tả ngắn về nhóm..."
                  placeholderTextColor="#94a3b8"
                  value={teamDescription}
                  onChangeText={setTeamDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => setCreateVisible(false)}
                  disabled={creating}
                >
                  <Text style={styles.btnCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnSubmit, creating && styles.btnDisabled]}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnSubmitText}>Tạo nhóm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextWrapper: {
    flex: 1,
    marginRight: 10,
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
  btnCreate: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  btnCreateText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  bannerCode: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  bannerClose: {
    fontSize: 16,
    color: '#059669',
    paddingHorizontal: 6,
  },
  joinCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  joinTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  joinRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    letterSpacing: 2,
  },
  btnJoin: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnJoinText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  joinError: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  teamAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  teamDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  teamCode: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 26,
    color: '#cbd5e1',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 70,
    paddingTop: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  btnSubmit: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
