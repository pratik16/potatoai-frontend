import type { ChatMeta } from './chat.types';

export interface Project {
  id:               string;
  _id:              string;
  name:             string;
  description:      string | null;
  emoji:            string | null;
  colour_hex:       string | null;
  default_model:    string | null;
  system_prompt:    string | null;
  chat_count:       number;
  last_activity_at: string | null;
  created_at:       string;
}

export interface ProjectDetail extends Project {
  chats: {
    data: ChatMeta[];
    meta: { current_page: number; per_page: number; total: number; has_more: boolean };
  };
}
