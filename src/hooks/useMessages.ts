import { useState, useEffect } from 'react';
import { ChatMessage } from '../types/message';
import { subscribeMessages } from '../services/messageService';

export const useMessages = (teamId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeMessages(
      teamId,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [teamId]);

  return { messages, loading };
};
