import { api } from "./client";

export const fetchJobStatus = async (jobId) => {
  const { data } = await api.get(`/jobs/${jobId}`);
  return data;
};

export const fetchCommits = async (repoFullName, limit = 10) => {
  const { data } = await api.get("/commits", {
    params: { repo_full_name: repoFullName, limit },
  });
  return data;
};

export const fetchRankings = async (repoFullName) => {
  const { data } = await api.get("/rankings", {
    params: { repo_full_name: repoFullName },
  });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await api.get("/data/export");
  return data;
};
