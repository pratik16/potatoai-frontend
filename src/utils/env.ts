/** True on `vite` dev server; false in production builds (deployed or `vite build`). */
export const isLocalDev = (import.meta as unknown as { env: { DEV: boolean } }).env.DEV;
