import axios from "axios";
import { getToken } from "../auth/token";

const baseURL =
  import.meta.env.VITE_API_BASE_URL;

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
