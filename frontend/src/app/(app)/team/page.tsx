import { AppHeader } from "@/src/components/layout/AppHeader";

export default function TeamPage() {
  return (
    <section>
      <AppHeader title="Team" subtitle="Thành viên và phân quyền nhóm" showFilter={false} />
      <article className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
        Quản lý team đang được phát triển
      </article>
    </section>
  );
}
