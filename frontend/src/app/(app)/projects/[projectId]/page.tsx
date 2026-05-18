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

  return <ProjectDetailView projectId={id} />;
}
