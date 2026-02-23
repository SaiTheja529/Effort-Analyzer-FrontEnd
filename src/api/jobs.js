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

export const fetchDeveloperTrends = async (
  repoFullName,
  { bucket = "week", days = 84, topN = 6 } = {}
) => {
  const { data } = await api.get("/rankings/trends", {
    params: {
      repo_full_name: repoFullName,
      bucket,
      days,
      top_n: topN,
    },
  });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await api.get("/data/export");
  return data;
};

export const deleteHistoryEntry = async (jobId) => {
  const { data } = await api.delete(`/jobs/${jobId}`);
  return data;
};

export const clearAllHistory = async () => {
  const { data } = await api.delete("/jobs/history/all");
  return data;
};
