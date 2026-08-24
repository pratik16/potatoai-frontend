import type { Artifact } from './artifact.types';

export interface ChatMeta {
  id:              string;
  _id:             string;   // MongoDB _id alias for compat
  title:           string;
  model:           string | null;
  project_id:      string | null;
  starred:         boolean;
  last_message_at: string | null;
  message_count:   number;
  created_at:      string;
}

export interface Message {
  id:               string;
  _id:              string;
  chat_id:          string;
  role:             'user' | 'assistant';
  content:          string;
  model:            string | null;
  thinking_content: string | null;
  artifacts:        Artifact[];
  attachments:      Attachment[];
  input_tokens:     number | null;
  output_tokens:    number | null;
  credits_deducted: number | null;
  edited_at:        string | null;
  is_branch_root:   boolean;
  created_at:       string;
  // image editing in chat
  image_asset_id?:  string | null;
  image_url?:       string | null;
  // Client-side only: why the image never arrived. The spinner keys off
  // image_asset_id && !image_url, so without this a failed job spins forever.
  image_error?:     string | null;
  // Set on the `done` SSE frame when the turn was routed by Auto rather than a
  // user-picked model. `model` above is already the concrete model that
  // answered (e.g. 'claude-sonnet-4-5') — these two only annotate *how* it got
  // picked, for the "Auto → …" badge in MessageBubble.
  routed_from?:     string | null;
  question_type?:   string | null;
}

export interface Attachment {
  filename:      string;
  mime_type:     string;
  s3_url:        string;
  s3_key?:       string;
  size_bytes?:   number;
  extracted_text?: string | null;
}

export interface ChatDetail extends ChatMeta {
  system_prompt: string | null;
  share_token:   string | null;
  messages:      Message[];
}

export interface ChatState {
  activeChatId:   string | null;
  selectedModel:  string;
  chats:          ChatMeta[];
  activeMessages: Message[];
  /** Set when the API rejects a send with code INSUFFICIENT_CREDITS. */
  outOfCredits:   boolean;
}

export interface SendMessageRequest {
  content:         string;
  model:           string;
  enable_thinking: boolean;
  enable_search:   boolean;
}
