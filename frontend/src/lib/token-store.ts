const ACCESS_KEY = "hf_access_token";
const REFRESH_KEY = "hf_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;

function init() {
  if (accessToken === null && typeof window !== "undefined") {
    try {
      accessToken = localStorage.getItem(ACCESS_KEY);
      refreshToken = localStorage.getItem(REFRESH_KEY);
    } catch {
    }
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) localStorage.setItem(ACCESS_KEY, token);
      else localStorage.removeItem(ACCESS_KEY);
    } catch {
    }
  }
}

export function getAccessToken(): string | null {
  init();
  return accessToken;
}

export function setRefreshToken(token: string | null): void {
  refreshToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) localStorage.setItem(REFRESH_KEY, token);
      else localStorage.removeItem(REFRESH_KEY);
    } catch {
    }
  }
}

export function getRefreshToken(): string | null {
  init();
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
    }
  }
}
