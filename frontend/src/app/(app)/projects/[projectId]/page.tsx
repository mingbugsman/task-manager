import { Suspense } from "react";
import { ProjectDetailView } from "@/src/features/projects/components/ProjectDetailView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const id = Number(projectId);

  if (Number.isNaN(id)) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
        <p className="text-slate-500">ID dự án không hợp lệ</p>
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="flex h-64 items-center justify-center">
          <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      }
    >
      <ProjectDetailView projectId={id} />
    </Suspense>
  );
}
