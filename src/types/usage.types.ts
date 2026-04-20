export interface UsageStats {
  total_chats:             number;
  chats_change_percent:    number;
  total_messages:          number;
  messages_change_percent: number;
  credits_used:            number;
  most_used_model:         string | null;
  most_used_model_percent: number;
}

export interface DailyUsage {
  date:  string;
  count: number;
}

export interface ModelUsage {
  model:    string;
  messages: number;
  percent:  number;
}

export interface RecentChat {
  id:       string;
  title:    string;
  model:    string;
  messages: number;
  credits:  number;
  date:     string;
}

export interface UsageResponse {
  month:          string;
  stats:          UsageStats;
  daily_messages: DailyUsage[];
  by_model:       ModelUsage[];
  recent_chats:   RecentChat[];
}

export interface TokenUsageResponse {
  total_input_tokens:      number;
  total_output_tokens:     number;
  avg_credits_per_message: number;
  daily_tokens:            { date: string; input: number; output: number }[];
}
