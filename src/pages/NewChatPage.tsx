import { EmptyState } from '../features/chat/components/EmptyState';
import { MessageInput } from '../features/chat/components/MessageInput';
import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { setActiveChat, clearMessages } from '../features/chat/chatSlice';

export default function NewChatPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveChat(null));
    dispatch(clearMessages());
  }, [dispatch]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <EmptyState />
      </div>
      <MessageInput />
    </div>
  );
}
