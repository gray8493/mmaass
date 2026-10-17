import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '../types/user';
import { ChatMessage } from '../types/message';

const messagesCollection = (teamId: string) =>
  collection(db, 'teams', teamId, 'messages');

const mapMessage = (id: string, data: Record<string, unknown>): ChatMessage => ({
  id,
  senderId: (data.senderId as string) || '',
  senderName: (data.senderName as string) || 'Thành viên',
  senderAvatarUrl: (data.senderAvatarUrl as string) || '',
  text: (data.text as string) || '',
  createdAt: (data.createdAt as string) || new Date().toISOString(),
});

/**
 * Lắng nghe tin nhắn của nhóm theo thời gian thực, sắp xếp theo thời gian gửi.
 */
export const subscribeMessages = (
  teamId: string,
  onSuccess: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const messagesQuery = query(messagesCollection(teamId), orderBy('createdAt', 'asc'));

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => mapMessage(d.id, d.data()));
      onSuccess(messages);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

/**
 * Gửi một tin nhắn mới vào nhóm.
 */
export const sendMessage = async (
  teamId: string,
  sender: AppUser,
  text: string
): Promise<ChatMessage> => {
  const messageData = {
    senderId: sender.id,
    senderName: sender.name,
    senderAvatarUrl: sender.avatarUrl || '',
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(messagesCollection(teamId), messageData);
  return { id: docRef.id, ...messageData };
};
