export interface User {
  id:                  number;
  name:                string;
  username:            string | null;
  email:               string;
  full_name:           string | null;
  avatar_url:          string | null;
  plan:                'free' | 'pro' | 'team';
  timezone:            string;
  theme:               'dark' | 'light' | 'system';
  ui_theme:            'potato' | 'claude';
  font_size:           'small' | 'medium' | 'large';
  compact_mode:        boolean;
  default_model:       string | null;
  streaming_enabled:   boolean;
  show_token_count:    boolean;
  memory_enabled:      boolean;
  thinking_enabled:    boolean;
  math_rendering:      boolean;
  diagram_rendering:   boolean;
  email_notifications: boolean;
  low_credit_alerts:   boolean;
  two_factor_enabled:  boolean;
  credit_balance:      number;
  email_verified_at:   string | null;
}

export interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

export interface LoginRequest {
  email:       string;
  password:    string;
  remember_me: boolean;
}

export interface RegisterRequest {
  name:                  string;
  email:                 string;
  password:              string;
  password_confirmation: string;
}

export interface AuthResponse {
  token:        string;
  access_token: string;
  user:         User;
}

export interface ActiveSession {
  id:             number;
  device_name:    string;
  ip_address:     string;
  last_active_at: string;
  created_at:     string;
  is_current:     boolean;
}

export interface CreditBalance {
  balance:              number;
  lifetime_earned:      number;
  lifetime_spent:       number;
  plan:                 string;
  plan_monthly_credits: number;
  reset_date:           string;
}

export interface CreditTransaction {
  type:           string;
  amount_decimal: number;
  description:    string;
  created_at:     string;
}
