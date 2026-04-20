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
}
