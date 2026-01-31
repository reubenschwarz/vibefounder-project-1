"use client";

import useSWR from "swr";
import type { JobStatusResponse } from "@/lib/schemas/api";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useJobPoll(jobId: string | null) {
  const { data, error } = useSWR<JobStatusResponse>(
    jobId ? `/api/jobs/${jobId}` : null,
    fetcher,
    {
      refreshInterval: (data) =>
        data?.status === "completed" || data?.status === "failed" ? 0 : 2000,
    }
  );

  return {
    job: data ?? null,
    isLoading: !error && !data && !!jobId,
    isError: !!error,
    isDone: data?.status === "completed",
    isFailed: data?.status === "failed",
  };
}
