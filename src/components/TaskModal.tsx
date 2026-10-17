import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Task, TaskPriority, TaskStatus, CreateTaskInput } from '../types/task';
import { Team, TeamMember } from '../types/team';
import { AppUser } from '../types/user';
import { getTeamMembers } from '../services/teamService';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  initialTask?: Task | null;
  teams: Team[];
  members?: TeamMember[];
  currentUser?: AppUser | null;
  defaultTeamId?: string | null;
}

const STATUS_OPTIONS: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High'];

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialTask,
  teams,
  members,
  currentUser,
  defaultTeamId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Giữ tham chiếu mới nhất tới danh sách nhóm để việc khởi tạo form không
  // phụ thuộc vào việc mảng `teams` được tạo lại mỗi lần cha re-render.
  const teamsRef = useRef(teams);
  teamsRef.current = teams;

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'To Do');
      setPriority(initialTask.priority || 'Medium');
      setDueDate(initialTask.dueDate || '');
      setTeamId(initialTask.teamId ?? defaultTeamId ?? null);
      setAssigneeId(initialTask.assigneeId ?? null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('Medium');
      setDueDate(today);
      setTeamId(defaultTeamId ?? teamsRef.current[0]?.id ?? null);
      setAssigneeId(null);
    }
    setErrorMessage('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTask, visible, defaultTeamId]);

  useEffect(() => {
    let active = true;
    if (!teamId) {
      setTeamMembers([]);
      return;
    }

    if (members && members.length > 0 && members[0].teamId === teamId) {
      setTeamMembers(members);
      return;
    }

    setLoadingMembers(true);
    getTeamMembers(teamId)
      .then((result) => {
        if (active) setTeamMembers(result);
      })
      .catch(() => {
        if (active) setTeamMembers([]);
      })
      .finally(() => {
        if (active) setLoadingMembers(false);
      });

    return () => {
      active = false;
    };
  }, [teamId, members]);

  const setRelativeDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const selectedTeam = teams.find((t) => t.id === teamId);
  const selectedMember = teamMembers.find((m) => m.userId === assigneeId);

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho công việc!');
      return;
    }
    if (!teamId) {
      setErrorMessage('Vui lòng chọn nhóm cho công việc. Hãy tạo nhóm trước.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate.trim(),
        teamId,
        teamName: selectedTeam?.name || '',
        assigneeId,
        assigneeName: selectedMember?.name || '',
        createdBy: currentUser?.id ?? null,
      });
      onClose();
    } catch (err) {
      setErrorMessage(
        'Đã có lỗi xảy ra khi lưu: ' + ((err as Error).message || 'Thử lại')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialTask ? '✏️ Chỉnh sửa công việc' : '✨ Tạo công việc mới'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formScroll}
          >
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Tiêu đề công việc <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên việc cần làm..."
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mô tả chi tiết</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả các yêu cầu hoặc ghi chú..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Nhóm (Team) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Nhóm phụ trách <Text style={styles.required}>*</Text>
              </Text>
              {teams.length === 0 ? (
                <Text style={styles.hintText}>
                  Bạn chưa tham gia nhóm nào. Hãy tạo hoặc tham gia nhóm trước.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipScroll}
                >
                  {teams.map((team) => {
                    const selected = teamId === team.id;
                    return (
                      <TouchableOpacity
                        key={team.id}
                        style={[styles.chip, selected && styles.chipActive]}
                        onPress={() => {
                          setTeamId(team.id);
                          setAssigneeId(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[styles.chipText, selected && styles.chipTextActive]}
                        >
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Người được giao việc (Assignee) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Người được giao việc</Text>
              {loadingMembers ? (
                <ActivityIndicator color="#2563eb" size="small" />
              ) : teamMembers.length === 0 ? (
                <Text style={styles.hintText}>
                  Chưa có thành viên nào trong nhóm để giao việc.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipScroll}
                >
                  <TouchableOpacity
                    style={[styles.chip, assigneeId === null && styles.chipActive]}
                    onPress={() => setAssigneeId(null)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        assigneeId === null && styles.chipTextActive,
                      ]}
                    >
                      Không giao
                    </Text>
                  </TouchableOpacity>
                  {teamMembers.map((member) => {
                    const selected = assigneeId === member.userId;
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={[styles.chip, selected && styles.chipActive]}
                        onPress={() => setAssigneeId(member.userId)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[styles.chipText, selected && styles.chipTextActive]}
                        >
                          {member.name || member.email}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Status */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Trạng thái (Status)</Text>
              <View style={styles.chipRow}>
                {STATUS_OPTIONS.map((opt) => {
                  const selected = status === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.chip,
                        styles.chipFlex,
                        selected && styles.chipActive,
                      ]}
                      onPress={() => setStatus(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Độ ưu tiên (Priority)</Text>
              <View style={styles.chipRow}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = priority === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.chip,
                        styles.chipFlex,
                        selected &&
                          (opt === 'High'
                            ? styles.chipHighActive
                            : opt === 'Medium'
                              ? styles.chipMediumActive
                              : styles.chipLowActive),
                      ]}
                      onPress={() => setPriority(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Due Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Hạn chót (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 2026-10-15"
                placeholderTextColor="#94a3b8"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <View style={styles.quickDateRow}>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setRelativeDate(0)}
                >
                  <Text style={styles.quickDateText}>Hôm nay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setRelativeDate(1)}
                >
                  <Text style={styles.quickDateText}>Ngày mai</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setRelativeDate(7)}
                >
                  <Text style={styles.quickDateText}>+1 tuần</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.btnCancelText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSubmit, isSubmitting && styles.btnSubmitDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.btnSubmitText}>
                {isSubmitting ? 'Đang lưu...' : initialTask ? 'Cập nhật' : 'Tạo mới'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  formScroll: {
    padding: 20,
    gap: 16,
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
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
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
  chipScroll: {
    gap: 8,
    paddingRight: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipFlex: {
    flex: 1,
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  chipHighActive: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  chipMediumActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  chipLowActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0369a1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  quickDateBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  quickDateText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  btnSubmitDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
