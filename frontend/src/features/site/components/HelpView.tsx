"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "./SiteFooter";

const faqs = [
  {
    q: "Làm sao để được giao task và thấy trong báo cáo cá nhân?",
    a: "Quản trị viên hoặc trưởng nhóm cần thêm bạn vào dự án và gán bạn làm người nhận (assignee) trên từng task. Báo cáo cá nhân chỉ tính các task được giao cho tài khoản của bạn.",
  },
  {
    q: "Khác biệt giữa vai trò Admin, Lead, Member và Viewer?",
    a: "Admin và Lead thường có quyền mời thành viên, chỉnh sửa cấu hình dự án hoặc board. Member tham gia thao tác task. Viewer chủ yếu xem — cụ thể tùy cấu hình backend của từng API.",
  },
  {
    q: "Làm thế nào để xem tiến độ toàn dự án?",
    a: "Vào chi tiết dự án và mở tab Analytics (Phân tích) để xem biểu đồ trạng thái, thành viên và ưu tiên.",
  },
  {
    q: "Trang Team hiển thị ai?",
    a: "Team gom những người bạn làm chung qua các dự án bạn tham gia — là danh bạ cộng tác, không phải nhóm cố định riêng.",
  },
  {
    q: "Tôi quên mật khẩu thì sao?",
    a: "Dùng luồng đặt lại mật khẩu trên trang đăng nhập nếu đã bật OTP/email trên môi trường của bạn. Nếu chưa cấu hình, liên hệ quản trị hệ thống.",
  },
];

export function HelpView() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Trợ giúp</h1>
        <p className="mt-1 text-sm text-slate-500">
          Câu hỏi thường gặp và liên kết nhanh tới các trang thông tin trên web.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <HelpCircle className="text-blue-600" size={22} />
            Câu hỏi thường gặp
          </h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start gap-2 py-4 text-left text-sm font-semibold text-slate-800 hover:text-blue-700"
                  >
                    {isOpen ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    {item.q}
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden text-sm text-slate-600 transition-all",
                      isOpen ? "max-h-96 pb-4 pl-6" : "max-h-0"
                    )}
                  >
                    {item.a}
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Liên kết</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-blue-600 hover:underline">
                  Giới thiệu sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-blue-600 hover:underline">
                  Nhật ký cập nhật
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </article>
        </aside>
      </div>

      <SiteFooter />
    </section>
  );
}
