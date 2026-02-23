const TOKEN_KEY = "ea_auth_token";
const LEGACY_TOKEN_KEY = "ea_gh_token";
const USER_KEY = "ea_user";

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || "";

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("ea_last_job");
};

export const storeUser = (user) => {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
