import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'Cao' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Vừa' };
      case 'Low':
      default:
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: 'Thấp' };
    }
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return { bg: '#dcfce7', text: '#15803d', label: 'Hoàn thành' };
      case 'In Progress':
        return { bg: '#fef9c3', text: '#854d0e', label: 'Đang làm' };
      case 'To Do':
      default:
        return { bg: '#f1f5f9', text: '#475569', label: 'Cần làm' };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const statusStyle = getStatusStyle(task.status);

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(
        `Bạn có chắc muốn xóa công việc "${task.title}" không?`
      );
      if (confirmDelete) {
        onDelete(task.id);
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa công việc "${task.title}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => onDelete(task.id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      {/* Header card: Status & Priority badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  task.status === 'Done'
                    ? '#22c55e'
                    : task.status === 'In Progress'
                      ? '#eab308'
                      : '#94a3b8',
              },
            ]}
          />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {task.status}
          </Text>
        </View>

        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border },
          ]}
        >
          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
            Ưu tiên: {task.priority}
          </Text>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>
      {task.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {task.description}
        </Text>
      ) : null}

      {/* Due Date & Action Buttons */}
      <View style={styles.footerRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Hạn chót:</Text>
          <Text style={styles.dateValue}>{task.dueDate ? task.dueDate : 'Chưa đặt'}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.btnAction, styles.btnEdit]}
            onPress={() => onEdit(task)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnEditText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAction, styles.btnDelete]}
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <Text style={styles.btnDeleteText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnEdit: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  btnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  btnDelete: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  btnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
});
