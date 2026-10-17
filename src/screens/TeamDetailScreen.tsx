import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useTeamDetail } from '../hooks/useTeamDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { Task, CreateTaskInput } from '../types/task';
import { TeamMember } from '../types/team';

type Props = NativeStackScreenProps<AppStackParamList, 'TeamDetail'>;

const getInitials = (name: string, email: string): string => {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.substring(0, 2).toUpperCase();
};

export const TeamDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { teamId, teamName } = route.params;
  const { user } = useAuth();
  const { team, members, loading } = useTeamDetail(teamId);
  const {
    tasks,
    addTask,
    editTask,
    removeTask,
    loading: tasksLoading,
  } = useTasks([teamId]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleModalSubmit = async (data: CreateTaskInput) => {
    if (selectedTask) {
      await editTask(selectedTask.id, data);
    } else {
      await addTask(data);
    }
  };

  const renderMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{getInitials(item.name, item.email)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName} numberOfLines={1}>
          {item.name || item.email.split('@')[0]}
        </Text>
        <Text style={styles.memberEmail} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <View
        style={[
          styles.roleBadge,
          item.role === 'leader' ? styles.roleLeader : styles.roleMember,
        ]}
      >
        <Text
          style={[
            styles.roleBadgeText,
            item.role === 'leader' ? styles.roleLeaderText : styles.roleMemberText,
          ]}
        >
          {item.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.teamHeader}>
                <View style={styles.teamAvatarLarge}>
                  <Text style={styles.teamAvatarLargeText}>
                    {(team?.name || teamName || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.teamName}>{team?.name || teamName}</Text>
                {team?.description ? (
                  <Text style={styles.teamDescription}>{team.description}</Text>
                ) : null}
                <View style={styles.teamMetaRow}>
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>Mã nhóm: {team?.code || '—'}</Text>
                  </View>
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{members.length} thành viên</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnChat}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      teamId,
                      teamName: team?.name || teamName || 'Nhóm',
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnChatText}>💬 Mở chat nhóm</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👥 Thành viên</Text>
              </View>
              {loading ? (
                <ActivityIndicator color="#2563eb" style={styles.sectionLoader} />
              ) : members.length === 0 ? (
                <Text style={styles.emptyHint}>Chưa có thành viên nào.</Text>
              ) : (
                members.map((member) => (
                  <View key={member.id}>{renderMember({ item: member })}</View>
                ))
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 Công việc của nhóm</Text>
                <TouchableOpacity
                  style={styles.btnAddTask}
                  onPress={() => {
                    setSelectedTask(null);
                    setModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnAddTaskText}>+ Thêm việc</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onEdit={(task) => {
                setSelectedTask(task);
                setModalVisible(true);
              }}
              onDelete={removeTask}
            />
          )}
          ListEmptyComponent={
            tasksLoading ? (
              <ActivityIndicator color="#2563eb" style={styles.sectionLoader} />
            ) : (
              <View style={styles.emptyTasks}>
                <Text style={styles.emptyHint}>
                  Nhóm chưa có công việc nào. Hãy thêm công việc đầu tiên!
                </Text>
              </View>
            )
          }
        />

        <TaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleModalSubmit}
          initialTask={selectedTask}
          teams={team ? [team] : []}
          members={members}
          currentUser={user}
          defaultTeamId={teamId}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  teamHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  teamAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamAvatarLargeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  teamDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  teamMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  codePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  codePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  countPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  btnChat: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnChatText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionLoader: {
    marginVertical: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  memberEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleLeader: {
    backgroundColor: '#fef3c7',
  },
  roleMember: {
    backgroundColor: '#f1f5f9',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleLeaderText: {
    color: '#b45309',
  },
  roleMemberText: {
    color: '#64748b',
  },
  btnAddTask: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAddTaskText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  emptyTasks: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
