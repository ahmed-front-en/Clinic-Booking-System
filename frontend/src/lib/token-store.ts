const REFRESH_KEY = "hf_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;

function init() {
  if (refreshToken === null && typeof window !== "undefined") {
    try {
      refreshToken = localStorage.getItem(REFRESH_KEY);
    } catch {
    }
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
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
      localStorage.removeItem(REFRESH_KEY);
    } catch {
    }
  }
}
