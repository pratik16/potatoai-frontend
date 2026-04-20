import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveChat, setMessages } from '../features/chat/chatSlice';
import { useGetChatQuery } from '../features/chat/chatApi';
import { ChatTopBar } from '../features/chat/components/ChatTopBar';
import { ChatArea } from '../features/chat/components/ChatArea';
import { MessageInput } from '../features/chat/components/MessageInput';
import { Spinner } from '../components/ui/Spinner';
import { pollImageAsset } from '../hooks/useChat';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const dispatch   = useAppDispatch();
  const token      = useAppSelector((s) => s.auth.token);

  const { data, isLoading } = useGetChatQuery(chatId!, { skip: !chatId });

  useEffect(() => {
    if (data) {
      dispatch(setActiveChat(data.id ?? data._id));
      dispatch(setMessages(data.messages));

      // Resume polling for any image that finished generating but image_url not yet set
      if (token) {
        data.messages.forEach((msg) => {
          if (msg.image_asset_id && !msg.image_url) {
            pollImageAsset(msg.image_asset_id, msg.id, token, dispatch);
          }
        });
      }
    }
    return () => { dispatch(setActiveChat(null)); };
  }, [data, token, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatTopBar title={data?.title ?? 'Chat'} />
      <ChatArea />
      <MessageInput />
    </div>
  );
}
