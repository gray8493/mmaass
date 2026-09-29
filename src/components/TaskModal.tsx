import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Task, TaskPriority, TaskStatus, CreateTaskInput } from '../types/task';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  initialTask?: Task | null;
}

const STATUS_OPTIONS: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High'];

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'To Do');
      setPriority(initialTask.priority || 'Medium');
      setDueDate(initialTask.dueDate || '');
    } else {
      // Giá trị mặc định khi tạo mới
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('Medium');
      setDueDate(today);
    }
    setErrorMessage('');
  }, [initialTask, visible]);

  const setRelativeDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    // Client-side validation: Tiêu đề không được để trống
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho công việc!');
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
      });
      onClose();
    } catch (err: any) {
      setErrorMessage('Đã có lỗi xảy ra khi lưu: ' + (err.message || 'Thử lại'));
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
          {/* Header Modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialTask ? '✏️ Chỉnh sửa công việc' : '✨ Tạo công việc mới'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Scrollable */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formScroll}
          >
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {/* Field Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Tiêu đề công việc <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errorMessage ? styles.inputError : null]}
                placeholder="Nhập tên việc cần làm..."
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Field Description */}
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

            {/* Status Select */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Trạng thái (Status)</Text>
              <View style={styles.chipRow}>
                {STATUS_OPTIONS.map((opt) => {
                  const selected = status === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, selected && styles.chipActive]}
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

            {/* Priority Select */}
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

          {/* Footer Buttons */}
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
    maxHeight: '90%',
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
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  textArea: {
    minHeight: 70,
    paddingTop: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
