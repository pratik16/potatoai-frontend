/**
 * Catalogue split introduced with image generation. Only `text` models can be
 * driven by the chat stream; `image` rows are billed per image and are reached
 * through the image endpoints, never the model picker.
 */
export type ModelType = 'text' | 'image';

/** What an image model can do. Always null on a text model. */
export type ImageCapability = 'generate' | 'edit';

export interface AiModel {
  id:                number;
  name:              string;
  slug:              string;
  provider:          string;
  colour_hex:        string;
  description:       string | null;
  is_active:         boolean;
  is_pro_only:       boolean;
  supports_vision:   boolean;
  supports_thinking: boolean;
  context_window:    number | null;
  sort_order:        number;
  /**
   * Optional on purpose. `GET /api/models` only started returning `type` with
   * the image-catalogue release, and the SPA deploys independently of the API,
   * so there is a window where this bundle runs against a backend that omits
   * the field. Never test it directly — go through `isTextModel()`, which reads
   * an absent value as 'text' so a deploy-order skew cannot empty the picker.
   */
  type?:             ModelType;
  /**
   * Set on the synthetic auto-routing row `GET /api/models` prepends to `data`
   * when auto-routing is enabled server-side (slug `'auto'`, id `0`,
   * `sort_order -1`). Prefer this flag over `slug === 'auto'` when checking —
   * go through `isAutoModel()` in `utils/modelConfig.ts` rather than testing
   * either field directly.
   */
  is_auto?:              boolean;
  /** Credit multiplier applied when Auto routes a turn, e.g. 0.5 = half credits. Only present on the auto row. */
  auto_credit_multiplier?: number | null;
}
