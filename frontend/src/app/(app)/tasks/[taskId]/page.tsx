import { TaskDetailView } from "@/src/features/tasks/components/TaskDetailView";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
  const id = Number(taskId);

  if (Number.isNaN(id)) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
        <p className="text-slate-500">ID tác vụ không hợp lệ</p>
      </section>
    );
  }

  return <TaskDetailView taskId={id} />;
}
