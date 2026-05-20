import { Suspense } from "react";
import { InviteAcceptView } from "@/src/features/projects/components/InviteAcceptView";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense
        fallback={
          <p className="text-sm text-slate-500">Đang tải lời mời…</p>
        }
      >
        <InviteAcceptView token={token} />
      </Suspense>
    </div>
  );
}
