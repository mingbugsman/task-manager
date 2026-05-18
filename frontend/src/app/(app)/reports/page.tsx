import { AppHeader } from "@/src/components/layout/AppHeader";

export default function ReportsPage() {
  return (
    <section>
      <AppHeader title="Báo Cáo" subtitle="Thống kê hiệu suất dự án" showFilter={false} />
      <article className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
        Báo cáo chi tiết đang được phát triển
      </article>
    </section>
  );
}
