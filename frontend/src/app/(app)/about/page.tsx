import { Zap } from "lucide-react";
import { AppHeader } from "@/src/components/layout/AppHeader";

export default function AboutPage() {
  return (
    <section>
      <AppHeader title="Giới Thiệu" showFilter={false} />
      <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <section className="mb-6 flex items-center gap-4">
          <section
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            <Zap size={28} />
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900">TaskManager / MIJTAP</h2>
            <p className="text-sm text-slate-500">Hệ thống quản lý tác vụ & dự án</p>
          </section>
        </section>
        <p className="leading-relaxed text-slate-600">
          Nền tảng quản lý dự án toàn diện với Kanban board, thông báo realtime, phân quyền
          theo role và dashboard trực quan. Phát triển bởi sinh viên HCMUNRE.
        </p>
      </article>
    </section>
  );
}
