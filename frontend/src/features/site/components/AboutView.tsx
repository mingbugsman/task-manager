"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIMARY_BLUE, NAVY_SIDEBAR, PAGE_BG } from "@/src/lib/constants";
import { SiteFooter } from "./SiteFooter";

const features = [
  {
    icon: CheckCircle2,
    title: "Quản lý tác vụ thông minh",
    description:
      "Theo dõi tiến độ với Kanban, trạng thái linh hoạt và deadline rõ ràng trên từng dự án.",
    color: "#2563EB",
  },
  {
    icon: Users,
    title: "Cộng tác nhóm",
    description:
      "Bình luận, đính kèm, reaction và thông báo giúp team đồng bộ mà không cần rời khỏi workspace.",
    color: "#0891B2",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & phân tích",
    description:
      "Dashboard, báo cáo cá nhân và analytics theo dự án để nhìn nhanh hiệu suất và tắc nghẽn.",
    color: "#7C3AED",
  },
  {
    icon: Clock,
    title: "Lịch & nhắc hạn",
    description:
      "Tích hợp lịch, task có hạn và thông báo để không bỏ lỡ mốc quan trọng.",
    color: "#DC2626",
  },
  {
    icon: Shield,
    title: "Phân quyền rõ ràng",
    description:
      "Vai trò theo dự án (Admin, Lead, Member, Viewer) và phân quyền hệ thống cho quản trị viên.",
    color: "#059669",
  },
  {
    icon: Layers,
    title: "Đa dự án",
    description:
      "Một tài khoản quản lý nhiều dự án, thống kê tổng quan và chuyển ngữ cảnh nhanh.",
    color: "#EA580C",
  },
];

const stats = [
  { value: "Kanban", label: "Bảng công việc" },
  { value: "Realtime", label: "Thông báo" },
  { value: "Team", label: "Danh bạ cộng tác" },
  { value: "Reports", label: "Báo cáo cá nhân" },
];

export function AboutView() {
  return (
    <section className="space-y-0 pb-8">
      <section
        className="relative overflow-hidden rounded-2xl border border-slate-200/60 px-6 py-14 sm:px-10 lg:px-14"
        style={{
          background: `linear-gradient(135deg, ${NAVY_SIDEBAR} 0%, #1E3A5F 35%, ${PRIMARY_BLUE} 70%, #1E3A5F 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
            style={{ background: "#3B82F6" }}
          />
          <div
            className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "#0891B2" }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center text-white">
          <div className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
            >
              <Zap size={26} />
            </span>
            <div className="text-left">
              <p className="text-sm font-bold">TaskManager Pro Workspace</p>
              <p className="text-xs text-blue-100/90">MIJTAP · Quản lý dự án & tác vụ</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Nền tảng làm việc nhóm hiện đại
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-100/95 sm:text-lg">
            Tập trung vào công việc thực sự: giao việc, theo dõi tiến độ, trao đổi ngay trên task và đo
            lường kết quả — thiết kế cho nhóm nhỏ đến trung bình, phù hợp môi trường học tập và doanh
            nghiệp thử nghiệm.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="rounded-xl bg-white px-6 font-semibold text-slate-900 hover:bg-blue-50"
            >
              <Link href="/dashboard">
                Vào workspace
                <ArrowRight className="ml-2 inline" size={18} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/40 bg-white/10 px-6 font-semibold text-white hover:bg-white/20"
            >
              <Link href="/contact">Liên hệ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-1">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Sứ mệnh</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Giảm nhiễu thông tin và công cụ rời rạc: một nơi để mọi người thấy việc cần làm, ai đang
              làm gì và khi nào cần xong — để team ra quyết định nhanh hơn.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Đối tượng sử dụng</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Sinh viên và nhóm dự án môn học, startup giai đoạn đầu, phòng ban nội bộ cần quy trình
              gọn nhẹ thay vì giải pháp nặng. Hệ thống được phát triển trong bối cảnh học tập tại
              HCMUNRE.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-5xl px-1">
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Tính năng nổi bật</h2>
          <p className="mt-2 text-sm text-slate-500">
            Các khối năng lực chính của TaskManager — tương tự trải nghiệm trang chủ giới thiệu sản phẩm.
          </p>
        </header>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: f.color }}
              >
                <f.icon size={22} />
              </span>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mx-auto mt-14 max-w-5xl rounded-2xl border border-slate-100 px-6 py-10 shadow-sm"
        style={{ background: PAGE_BG }}
      >
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="text-center">
              <p className="text-xl font-bold text-blue-600 sm:text-2xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{s.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-14 max-w-3xl rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-8 py-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Bắt đầu trong vài phút</h2>
        <p className="mt-3 text-sm text-slate-600">
          Tạo dự án, mời thành viên và kéo thả task trên bảng Kanban — hoặc xem báo cáo cá nhân để biết
          bạn đang nằm ở đâu trong tiến độ chung.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl bg-blue-600 px-6 hover:bg-blue-700">
            <Link href="/projects">Dự án của tôi</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-slate-200">
            <Link href="/help">Câu hỏi thường gặp</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </section>
  );
}
