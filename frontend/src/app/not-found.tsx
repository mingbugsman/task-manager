import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIMARY_BLUE } from "@/src/lib/constants";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <section className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <span
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
          style={{ backgroundColor: `${PRIMARY_BLUE}14`, color: PRIMARY_BLUE }}
          aria-hidden
        >
          <SearchX size={40} strokeWidth={1.5} />
        </span>

        <p className="text-7xl font-bold tracking-tight text-slate-200">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Đường dẫn bạn truy cập không tồn tại, đã bị xóa hoặc bạn không có quyền xem trang
          này.
        </p>

        <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home size={16} className="mr-2" aria-hidden />
              Về Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">
              <ArrowLeft size={16} className="mr-2" aria-hidden />
              Đăng nhập
            </Link>
          </Button>
        </section>

        <p className="mt-10 text-xs text-slate-400">
          Cần hỗ trợ?{" "}
          <Link href="/help" className="font-medium text-blue-600 hover:underline">
            Trung tâm trợ giúp
          </Link>
          {" · "}
          <Link href="/contact" className="font-medium text-blue-600 hover:underline">
            Liên hệ
          </Link>
        </p>
      </section>
    </main>
  );
}
