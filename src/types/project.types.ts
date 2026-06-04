import type { ChatMeta } from './chat.types';

export interface ProjectFile {
  filename:         string;
  mime_type:        string | null;
  size_bytes:       number | null;
  s3_url:           string | null;
  text_information: string | null;
}

export interface ProjectFileLimits {
  max_files:          number;
  max_file_size_mb:   number;
  allowed_mime_types: string[];
  allowed_extensions: string[];
}

export interface Project {
  id:               string;
  _id:              string;
  name:             string;
  description:      string | null;
  emoji:            string | null;
  colour_hex:       string | null;
  default_model:    string | null;
  system_prompt:    string | null;
  files?:           ProjectFile[];
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
