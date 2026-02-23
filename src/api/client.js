import axios from "axios";
import { getToken } from "../auth/token";

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const isPlaceholder = !envBaseUrl || envBaseUrl === "YOUR_BACKEND_URL";
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const baseURL = isPlaceholder
  ? isLocalHost
    ? "http://127.0.0.1:8000"
    : "https://effort-analyzer-backend.onrender.com"
  : envBaseUrl;

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.message ||
      "Unexpected error";
    return Promise.reject(new Error(message));
  }
);
