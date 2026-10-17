import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../services/messageService';
import { ChatMessage } from '../types/message';

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const formatDay = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name || '?').substring(0, 2).toUpperCase();
};

export const ChatScreen: React.FC<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { user } = useAuth();
  const { messages, loading } = useMessages(teamId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  if (!user) return null;

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    try {
      setSending(true);
      const value = text.trim();
      setText('');
      await sendMessage(teamId, user, value);
    } catch (error) {
      // Không khôi phục text để tránh chồng chéo khi gửi thất bại
      setText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === user.id;
    return (
      <View style={[styles.messageRow, isOwn ? styles.rowOwn : styles.rowOther]}>
        {!isOwn ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.senderName)}</Text>
          </View>
        ) : null}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {!isOwn ? <Text style={styles.senderName}>{item.senderName}</Text> : null}
          <Text style={isOwn ? styles.textOwn : styles.textOther}>{item.text}</Text>
          <Text style={isOwn ? styles.timeOwn : styles.timeOther}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const lastDay = messages.length > 0 ? formatDay(messages[0].createdAt) : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.dayBanner}>
          <Text style={styles.dayBannerText}>
            {lastDay ? `Trao đổi ngày ${lastDay}` : 'Bắt đầu cuộc trò chuyện'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy gửi lời chào đầu tiên tới các thành viên trong nhóm!
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.btnSend, (!text.trim() || sending) && styles.btnSendDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnSendText}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flex: {
    flex: 1,
  },
  dayBanner: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayBannerText: {
    fontSize: 11,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 3,
  },
  textOwn: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 19,
  },
  textOther: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 19,
  },
  timeOwn: {
    fontSize: 10,
    color: '#bfdbfe',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeOther: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    maxHeight: 110,
  },
  btnSend: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSendDisabled: {
    opacity: 0.5,
  },
  btnSendText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
