import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const client = axios.create({ baseURL: BASE_URL });

const TOKEN_KEY = "t10_auth_token";

// Real browsers always have window.localStorage. Some test/SSR
// environments don't (or don't wire it up the way we expect), so fall
// back to an in-memory store rather than letting every module that
// touches auth state crash.
const memoryStorage = new Map();

function storageAvailable() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getStoredToken() {
  if (storageAvailable()) return window.localStorage.getItem(TOKEN_KEY);
  return memoryStorage.get(TOKEN_KEY) ?? null;
}

export function setStoredToken(token) {
  if (storageAvailable()) {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    return;
  }

  if (token) {
    memoryStorage.set(TOKEN_KEY, token);
  } else {
    memoryStorage.delete(TOKEN_KEY);
  }
}

client.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// devise-jwt returns the (possibly refreshed) token on every authenticated
// response via the Authorization header -- capture it so the session stays
// valid without the user having to log in again.
client.interceptors.response.use(
  (response) => {
    const authHeader = response.headers?.authorization;
    if (authHeader) {
      setStoredToken(authHeader.replace(/^Bearer\s+/i, ""));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default client;
