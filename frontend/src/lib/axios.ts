import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from "./token-store";
import { showToast } from "./toast-store";
import { API_BASE_URL } from "../config";

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: storedRefreshToken,
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    return newAccessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      showToast("Session expired. Please log in again.", "error");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
