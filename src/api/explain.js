import { api } from "./client";

export const fetchRepoContext = async (repoFullName) => {
  const { data } = await api.post("/repo-context/fetch", {
    repo_full_name: repoFullName,
  });
  return data;
};

export const getRepoContext = async (repoFullName) => {
  const { data } = await api.get("/repo-context", {
    params: { repo_full_name: repoFullName },
  });
  return data;
};

export const fetchRepoExplanation = async (repoFullName, detailLevel = "deep") => {
  const { data } = await api.post("/repo-explain", {
    repo_full_name: repoFullName,
    detail_level: detailLevel,
  });
  return data;
};
