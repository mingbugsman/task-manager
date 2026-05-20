import Link from "next/link";
import { SiteFooter } from "./SiteFooter";

const releases = [
  {
    version: "0.3",
    date: "2026",
    items: [
      "Trang Team: danh bạ cộng tác theo dự án",
      "Báo cáo cá nhân (Reports) với biểu đồ theo tuần/tháng/quý",
      "Trang Giới thiệu, Liên hệ, Trợ giúp, Bảo mật & Điều khoản",
    ],
  },
  {
    version: "0.2",
    date: "2026",
    items: [
      "Analytics theo dự án, reaction bình luận",
      "Lịch tổng hợp task, tìm kiếm theo ngữ cảnh",
    ],
  },
  {
    version: "0.1",
    date: "2026",
    items: ["Kanban, thành viên dự án, thông báo, đăng nhập JWT"],
  },
];

export function ChangelogView() {
  return (
    <section className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Nhật ký cập nhật</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tóm tắt thay đổi theo phiên bản (demo). Chi tiết kỹ thuật xem repository của dự án.
        </p>
      </header>

      <ol className="relative mx-auto max-w-3xl border-l border-slate-200 pl-8">
        {releases.map((r) => (
          <li key={r.version} className="mb-10 last:mb-0">
            <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-white" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phiên bản {r.version} · {r.date}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
              {r.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-slate-500">
        <Link href="/about" className="font-medium text-blue-600 hover:underline">
          ← Về giới thiệu
        </Link>
      </p>

      <SiteFooter />
    </section>
  );
}
