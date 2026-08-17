import type { ModelType, ImageCapability } from './model.types';

export type { ModelType, ImageCapability };

export interface AdminState {
  isAccessVerified: boolean;
  currentIp:        string | null;
}

/**
 * A Postgres numeric/decimal column. Laravel's `decimal:n` casts serialise as
 * JSON strings, and raw SUM() aliases skip casts entirely and come back as
 * strings too — so never call .toFixed() on one directly. Pass it through
 * `num()` / `formatNumeric()` from features/admin/components/AdminShared.
 */
export type Numeric = number | string;

export interface DashboardData {
  credits:  { granted_this_month: number; spent_this_month: number; remaining_pool: number };
  cost:     { provider_cost_usd_this_month: number; estimated_revenue_usd: number; gross_margin_percent: number };
  users:    { active_today: number; total_registered: number };
  messages: { sent_today: number; sent_this_month: number };
}

/**
 * A pricing row rates EITHER tokens OR images, never both — the two sets are
 * mutually exclusive and the unused side is NULL in Postgres:
 *
 *   text model  → the five token columns are set, `credit_per_image` is NULL
 *   image model → the five token columns are NULL, `credit_per_image` is set
 *
 * So every rate here is nullable and must be rendered through `formatNumeric()`
 * / `num()` (from features/admin/components/AdminShared), never `.toFixed()`.
 */
export interface ActivePricing {
  id:                            number;
  model_id:                      number;
  provider_input_price_per_1m:   Numeric | null;
  provider_output_price_per_1m:  Numeric | null;
  margin_percent:                Numeric | null;
  credit_per_input_1k:           Numeric | null;
  credit_per_output_1k:          Numeric | null;
  /** Flat credit charge per generated image. Set only on image models. */
  credit_per_image:              Numeric | null;
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
  /**
   * Optional for the same reason as on the public `AiModel`: the admin bundle
   * can be live against an API that predates the text/image split. Absent means
   * 'text' — every model that existed before the split was one.
   */
  type?:             ModelType;
  /** Only ever set on an image model; null on text. */
  image_capability?: ImageCapability | null;
  active_pricing: ActivePricing | null;
  /**
   * Set only on soft-deleted (archived) models, and only present at all when
   * the list was fetched with `with_removed=1`. Optional on purpose: absent
   * and null both mean "live", so always test truthiness, never `!== null`.
   */
  deleted_at?:    string | null;
}

/**
 * `POST /api/admin/models` body.
 *
 * Mirrors the NOT NULL columns of the `ai_models` table — `router` and
 * `router_model_id` have no DB default, so omitting either fails the insert.
 * `router_model_id` is the id the upstream router knows (e.g.
 * `anthropic/claude-sonnet-4.5`), which is NOT the same string as our `slug`.
 */
export interface NewModelData {
  name:              string;
  slug:              string;
  provider:          string;
  router:            string;
  router_model_id:   string;
  colour_hex:        string;
  description:       string | null;
  is_active:         boolean;
  is_pro_only:       boolean;
  supports_vision:   boolean;
  supports_thinking: boolean;
  context_window:    number | null;
  sort_order:        number;
  /** Decides how the model is priced and whether chat may offer it. */
  type:              ModelType;
  /** Required when `type` is 'image'; must be null for a text model. */
  image_capability:  ImageCapability | null;
}

/** Machine-readable outcome of `DELETE /api/admin/models/{id}`. Branch on this, never on `message`. */
export type ModelRemovalAction = 'hard_deleted' | 'soft_deleted';

export interface ModelRemovalResult {
  action:  ModelRemovalAction;
  /** Human explanation of why the row was archived rather than dropped. Display only. */
  message: string;
}

export interface AdminModelsParams {
  /** Include soft-deleted (archived) models in the response. */
  with_removed?: boolean;
}

export type PricingRow = ActivePricing;

/**
 * `POST /api/admin/pricing/{modelId}` body. Same either/or as `ActivePricing`:
 * send the three token inputs (the server derives credit_per_*_1k from them)
 * for a text model, or `credit_per_image` for an image model, with the unused
 * side explicitly null. Never send both.
 */
export interface NewPricingData {
  provider_input_price_per_1m:  number | null;
  provider_output_price_per_1m: number | null;
  margin_percent:               number | null;
  /**
   * Image models only. Optional so the existing text-only pricing editor can
   * keep posting its form as-is; absent and null both mean "not per-image".
   */
  credit_per_image?:            number | null;
  effective_from:               string;
  notes:                        string;
}

export interface CreditsConfig {
  id:                        number;
  usd_per_credit:            Numeric;
  reserve_percent:           Numeric;
  free_plan_monthly_credits: Numeric;
  pro_plan_monthly_credits:  Numeric;
  team_plan_monthly_credits: Numeric;
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
  credit_balance:         Numeric;
  is_suspended:           boolean;
  created_at:             string;
  messages_this_month?:   Numeric;
  credits_used_this_month?: Numeric;
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
  provider_cost:   { total_usd: Numeric; by_model: { model: string; cost_usd: Numeric; tokens: Numeric }[] };
  credits_granted: Numeric;
  credits_spent:   Numeric;
}

export interface UsageAnalyticsData {
  daily:    { date: string; messages: Numeric; input_tokens: Numeric; output_tokens: Numeric }[];
  by_model: { model: string; messages: Numeric; percent: Numeric }[];
}

export interface PricingHistoryResponse {
  model:           { id: number; name: string };
  pricing_history: PricingRow[];
}
