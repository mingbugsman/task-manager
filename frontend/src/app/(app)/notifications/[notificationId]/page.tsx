import { NotificationDetailView } from "@/src/features/notifications/components/NotificationDetailView";

interface PageProps {
  params: Promise<{ notificationId: string }>;
}

export default async function NotificationDetailPage({ params }: PageProps) {
  const { notificationId } = await params;
  const id = Number(notificationId);

  if (Number.isNaN(id)) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
        <p className="text-slate-500">ID thông báo không hợp lệ</p>
      </section>
    );
  }

  return <NotificationDetailView notificationId={id} />;
}
