import { api } from "./client";

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
