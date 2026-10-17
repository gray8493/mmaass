import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { useAuth } from '../contexts/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { Task, CreateTaskInput } from '../types/task';

const STATUS_FILTERS = ['All', 'To Do', 'In Progress', 'Done'];

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { teams } = useTeams(user?.id ?? null);
  const teamIds = teams.map((t) => t.id);

  const {
    tasks,
    allTasksCount,
    loading,
    refreshing,
    filterStatus,
    setFilterStatus,
    isRealtime,
    refreshTasks,
    addTask,
    editTask,
    removeTask,
  } = useTasks(teamIds);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleModalSubmit = async (data: CreateTaskInput) => {
    if (selectedTask) {
      await editTask(selectedTask.id, data);
    } else {
      await addTask(data);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.appName}>📋 TaskFlow Manager</Text>
            <Text style={styles.appSubtitle}>Xin chào, {user?.name || 'bạn'} 👋</Text>
          </View>

          <View style={styles.syncBadge}>
            <View
              style={[
                styles.syncDot,
                { backgroundColor: isRealtime ? '#22c55e' : '#f59e0b' },
              ]}
            />
            <Text style={styles.syncText}>
              {isRealtime ? 'Firestore Live' : 'Sẵn sàng'}
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <View style={styles.statsSummary}>
            <Text style={styles.statsText}>
              Tổng số: <Text style={styles.statsCountHighlight}>{allTasksCount}</Text>{' '}
              công việc
            </Text>
            <Text style={styles.statsSubText}>{teams.length} nhóm đang tham gia</Text>
          </View>

          <TouchableOpacity
            style={styles.btnCreate}
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCreateText}>+ Thêm việc mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterListContent}
            renderItem={({ item }) => {
              const isActive = filterStatus === item;
              const filterLabel =
                item === 'All'
                  ? 'Tất cả'
                  : item === 'To Do'
                    ? 'Cần làm'
                    : item === 'In Progress'
                      ? 'Đang làm'
                      : 'Hoàn thành';

              return (
                <TouchableOpacity
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilterStatus(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filterLabel}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải công việc từ Firestore...</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshTasks}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            renderItem={({ item }) => (
              <TaskCard task={item} onEdit={handleOpenEditModal} onDelete={removeTask} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>
                  {teams.length === 0
                    ? 'Bạn chưa tham gia nhóm nào'
                    : 'Chưa có công việc nào'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {teams.length === 0
                    ? 'Hãy vào tab "Nhóm" để tạo nhóm mới hoặc tham gia nhóm bằng mã, sau đó tạo công việc cho nhóm.'
                    : filterStatus !== 'All'
                      ? `Không có công việc nào ở trạng thái "${filterStatus}".`
                      : 'Hãy bắt đầu tạo công việc đầu tiên cho nhóm của bạn!'}
                </Text>
                {teams.length > 0 ? (
                  <TouchableOpacity
                    style={styles.btnEmptyCreate}
                    onPress={handleOpenCreateModal}
                  >
                    <Text style={styles.btnEmptyCreateText}>Tạo công việc ngay</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            }
          />
        )}

        <TaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleModalSubmit}
          initialTask={selectedTask}
          teams={teams}
          currentUser={user}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  statsSummary: {
    justifyContent: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#64748b',
  },
  statsSubText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  statsCountHighlight: {
    fontWeight: '700',
    color: '#2563eb',
    fontSize: 15,
  },
  btnCreate: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnCreateText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    backgroundColor: '#ffffff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
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
    marginBottom: 18,
  },
  btnEmptyCreate: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  btnEmptyCreateText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
});
