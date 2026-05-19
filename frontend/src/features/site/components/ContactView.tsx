"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { Loader2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { contactApi } from "../api/contact.api";
import { SiteFooter } from "./SiteFooter";

const SUPPORT_EMAIL = "support.taskmanager.hcmunre@gmail.com";
const PHONE_DISPLAY = "028 3784 2156";
const ADDRESS =
  "Phòng dự án phần mềm — 236B Lê Văn Sỹ, phường 10, quận Phú Nhuận, TP. Hồ Chí Minh (HCMUNRE)";

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { detail?: string; message?: string; title?: string };
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
  }
  if (err instanceof Error) return err.message;
  return "Không gửi được tin nhắn. Vui lòng thử lại sau.";
}

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSubmitting(true);
    try {
      const res = await contactApi.sendMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setSuccess(res.data.message ?? "Đã gửi thành công.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-10 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Liên hệ</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          Gửi góp ý, báo lỗi hoặc đề xuất hợp tác. Tin nhắn được chuyển thẳng tới hòm thư hỗ trợ qua
          email; khi trả lời, chúng tôi sẽ dùng đúng địa chỉ email bạn nhập bên dưới.
        </p>
      </header>

      {success ? (
        <article
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </article>
      ) : null}
      {error ? (
        <article
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {error}
        </article>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-5">
        <aside className="space-y-4 lg:col-span-2">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Thông tin liên hệ</h2>
            <ul className="mt-4 space-y-5 text-sm text-slate-600">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-800">Email hỗ trợ</span>
                  <br />
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-0.5 inline-block text-blue-600 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-800">Điện thoại</span>
                  <br />
                  <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-blue-700">
                    {PHONE_DISPLAY}
                  </a>
                  <span className="mt-1 block text-xs text-slate-500">Giờ hành chính: 8:00–17:30, thứ Hai đến thứ Sáu</span>
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-800">Địa chỉ</span>
                  <br />
                  {ADDRESS}
                </span>
              </li>
            </ul>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm leading-relaxed text-slate-700">
            <MessageSquare className="mb-2 h-5 w-5 text-blue-600" aria-hidden />
            <p>
              Cần hướng dẫn nhanh về tính năng? Xem{" "}
              <Link href="/help" className="font-semibold text-blue-700 hover:underline">
                Trợ giúp & FAQ
              </Link>
              .
            </p>
          </article>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3"
        >
          <h2 className="text-lg font-bold text-slate-900">Gửi tin nhắn</h2>
          <p className="mt-1 text-xs text-slate-500">
            Bạn cần đăng nhập để gửi form. Nội dung được gửi qua máy chủ tới {SUPPORT_EMAIL}.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Họ tên</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="rounded-xl"
                required
                maxLength={120}
                autoComplete="name"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Email nhận phản hồi</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
                className="rounded-xl"
                required
                autoComplete="email"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2 text-sm">
            <span className="font-medium text-slate-700">Tiêu đề</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Góp ý tính năng, báo lỗi, hợp tác…"
              className="rounded-xl"
              maxLength={200}
            />
          </label>
          <label className="mt-4 block space-y-2 text-sm">
            <span className="font-medium text-slate-700">Nội dung</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Mô tả chi tiết để đội hỗ trợ xử lý nhanh hơn…"
              required
              maxLength={5000}
            />
          </label>
          <Button
            type="submit"
            disabled={submitting}
            className={cn("mt-6 rounded-xl bg-blue-600 px-6 hover:bg-blue-700", submitting && "opacity-80")}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi tin nhắn
              </>
            )}
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Máy chủ cần biến môi trường <code className="rounded bg-slate-100 px-1">MAIL_PASSWORD</code>{" "}
            (mật khẩu ứng dụng Gmail) cùng tài khoản{" "}
            <code className="rounded bg-slate-100 px-1">MAIL_USERNAME</code> trùng hòm thư gửi. Xem
            file <code className="rounded bg-slate-100 px-1">backend/taskmanager/MAIL_SETUP.md</code>{" "}
            trong repo để cấu hình.
          </p>
        </form>
      </div>

      <SiteFooter />
    </section>
  );
}
