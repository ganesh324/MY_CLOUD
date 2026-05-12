/** In dev, default to Vite proxy (`vite.config.js` `/api` → backend) when unset. */
const API_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ''
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? '/api'
      : '';

/** Parent path for uploads / new folders when the UI has no folder open. Must match backend MOUNT_POINT. */
export const STORAGE_ROOT = import.meta.env.VITE_STORAGE_ROOT || '/mnt/Drive1';

export default API_URL;
