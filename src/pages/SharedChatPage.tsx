import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { BrandLogo } from '../components/BrandLogo';
import { MessageBubble } from '../features/chat/components/MessageBubble';

interface SharedMessage {
  id:               string;
  role:             'user' | 'assistant';
  content:          string;
  model:            string | null;
  thinking_content: string | null;
  artifacts:        unknown[];
  created_at:       string;
}

interface SharedChatData {
  title:    string;
  model:    string | null;
  messages: SharedMessage[];
  shared_by: { name: string } | null;
}

export default function SharedChatPage() {
  const { token } = useParams<{ token: string }>();

  const [data, setData]       = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gone, setGone]       = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${token}`)
      .then(async (res) => {
        if (res.status === 410 || res.status === 404) { setGone(true); return; }
        const json = await res.json();
        setData(json);
      })
      .catch(() => setGone(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (gone || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-0 text-center">
        <span className="mb-4 text-5xl">🔗</span>
        <h1 className="mb-2 text-2xl font-bold text-white">Link expired</h1>
        <p className="mb-6 text-gray-400">This shared chat is no longer available.</p>
        <Link to="/login" className="text-potato-500 hover:text-potato-400 text-sm">
          Sign in to PotatoChat →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1 px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo size="sm" />
          <Link
            to="/register"
            className="rounded-lg bg-potato-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-potato-700"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Chat title */}
      <div className="mx-auto w-full max-w-3xl px-6 py-6">
        <h1 className="text-xl font-semibold text-white">{data.title}</h1>
        {data.shared_by && (
          <p className="mt-1 text-sm text-gray-500">Shared by {data.shared_by.name}</p>
        )}
      </div>

      {/* Messages */}
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-6 pb-16">
        {data.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={{
              id:               msg.id,
              _id:              msg.id,
              chat_id:          '',
              role:             msg.role,
              content:          msg.content,
              model:            msg.model,
              thinking_content: msg.thinking_content,
              artifacts:        [],
              attachments:      [],
              input_tokens:     null,
              output_tokens:    null,
              credits_deducted: null,
              edited_at:        null,
              is_branch_root:   false,
              created_at:       msg.created_at,
            }}
          />
        ))}
      </div>

      {/* CTA footer */}
      <div className="border-t border-surface-3 bg-surface-1 px-6 py-6 text-center">
        <p className="mb-3 text-gray-400 text-sm">Continue this conversation with your own account</p>
        <Link
          to="/register"
          className="inline-block rounded-lg bg-potato-600 px-6 py-2 text-sm font-medium text-white hover:bg-potato-700"
        >
          Create a free account →
        </Link>
      </div>
    </div>
  );
}

