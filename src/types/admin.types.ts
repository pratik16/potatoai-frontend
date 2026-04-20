export interface AdminState {
  isAccessVerified: boolean;
  currentIp:        string | null;
}

export interface DashboardData {
  credits:  { granted_this_month: number; spent_this_month: number; remaining_pool: number };
  cost:     { provider_cost_usd_this_month: number; estimated_revenue_usd: number; gross_margin_percent: number };
  users:    { active_today: number; total_registered: number };
  messages: { sent_today: number; sent_this_month: number };
}

export interface ActivePricing {
  id:                            number;
  model_id:                      number;
  provider_input_price_per_1m:   number;
  provider_output_price_per_1m:  number;
  margin_percent:                number;
  credit_per_input_1k:           number;
  credit_per_output_1k:          number;
  effective_from:                string;
  created_by_ip:                 string;
  notes:                         string | null;
}

export interface AdminModel {
  id:             number;
  name:           string;
  slug:           string;
  provider:       string;
  colour_hex:     string;
  is_active:      boolean;
  is_pro_only:    boolean;
  sort_order:     number;
  active_pricing: ActivePricing | null;
}

export interface PricingRow extends ActivePricing {}

export interface NewPricingData {
  provider_input_price_per_1m:  number;
  provider_output_price_per_1m: number;
  margin_percent:               number;
  effective_from:               string;
  notes:                        string;
}

export interface CreditsConfig {
  id:                        number;
  usd_per_credit:            number;
  reserve_percent:           number;
  free_plan_monthly_credits: number;
  pro_plan_monthly_credits:  number;
  team_plan_monthly_credits: number;
}

export interface IpEntry {
  id:               number;
  ip_address:       string;
  label:            string | null;
  is_active:        boolean;
  is_current:       boolean;
  last_accessed_at: string | null;
  created_at:       string;
}

export interface IpListResponse {
  current_ip: string;
  data:        IpEntry[];
}

export interface AuditLog {
  id:          number;
  ip_address:  string;
  action:      string;
  entity_type: string;
  entity_id:   number;
  old_values:  Record<string, unknown> | null;
  new_values:  Record<string, unknown> | null;
  created_at:  string;
}

export interface PaginatedMeta {
  current_page: number;
  per_page:     number;
  total:        number;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: PaginatedMeta;
}

export interface AuditLogParams {
  page?:     number;
  per_page?: number;
  action?:   string;
  ip?:       string;
  from?:     string;
  to?:       string;
}

export interface AdminUser {
  id:                     number;
  name:                   string;
  email:                  string;
  plan:                   string;
  credit_balance:         number;
  is_suspended:           boolean;
  created_at:             string;
  messages_this_month?:   number;
  credits_used_this_month?: number;
}

export interface UsersResponse {
  data: AdminUser[];
  meta: PaginatedMeta;
}

export interface UserListParams {
  page?:     number;
  per_page?: number;
  search?:   string;
  plan?:     string;
}

export interface RevenueData {
  month:           string;
  provider_cost:   { total_usd: number; by_model: { model: string; cost_usd: number; tokens: number }[] };
  credits_granted: number;
  credits_spent:   number;
}

export interface UsageAnalyticsData {
  daily:    { date: string; messages: number; input_tokens: number; output_tokens: number }[];
  by_model: { model: string; messages: number; percent: number }[];
}

export interface PricingHistoryResponse {
  model:           { id: number; name: string };
  pricing_history: PricingRow[];
}
