"use client";

import useSWR from "swr";
import { useSession } from "@/hooks/use-session";
import { CvpForm } from "@/components/cvp/cvp-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { CvpFields } from "@/lib/schemas/session";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InputsPage() {
  const session = useSession();
  const { data, isLoading, mutate } = useSWR<CvpFields>(
    `/api/s/${session.id}/cvp`,
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">CVP Input</h1>
      <CvpForm
        initialData={data ?? ({} as CvpFields)}
        onSaved={() => mutate()}
      />
    </div>
  );
}
