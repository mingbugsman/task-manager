import { AppHeader } from "@/src/components/layout/AppHeader";

export default function AdminLogsPage() {
  return (
    <section>
      <AppHeader title="System Logs" subtitle="Nhật ký hệ thống" showFilter={false} />
      <article className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
        System logs đang được phát triển
      </article>
    </section>
  );
}
