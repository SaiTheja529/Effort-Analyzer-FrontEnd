import { api } from "./client";

export const registerLocalUser = async ({ email, password, name }) => {
  const { data } = await api.post("/auth/register", {
    email,
    password,
    name,
  });
  return data;
};

export const loginLocalUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });
  return data;
};

export const fetchLocalUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const exchangeGithubCode = async (code, redirectUri) => {
  const { data } = await api.post("/auth/github/token", {
    code,
    redirect_uri: redirectUri,
  });
  return data;
};

export const fetchGithubUser = async () => {
  const { data } = await api.get("/auth/github/me");
  return data;
};
