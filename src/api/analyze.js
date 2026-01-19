import { api } from "./client";

export const startAnalysis = async (payload) => {
  const { data } = await api.post("/analyze-repo", payload);
  return data;
};
