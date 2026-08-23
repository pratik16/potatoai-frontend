/** True on `vite` dev server; false in production builds (deployed or `vite build`). */
export const isLocalDev = (import.meta as unknown as { env: { DEV: boolean } }).env.DEV;

/**
 * Temporary: plans/billing UI is hidden while every account is billed as a plain user
 * (there is no Stripe checkout wired into this app either). Flip to `true` to restore
 * the Billing tab, plan card, plan labels, and upgrade copy.
 */
export const PLANS_ENABLED = false;
