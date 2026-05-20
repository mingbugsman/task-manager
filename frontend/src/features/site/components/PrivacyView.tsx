import Link from "next/link";
import { SiteFooter } from "./SiteFooter";

export function PrivacyView() {
  return (
    <section className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Chính sách bảo mật</h1>
        <p className="mt-1 text-sm text-slate-500">Phiên bản mẫu cho mục đích demo — cập nhật trước khi go-live.</p>
      </header>

      <article className="max-w-none space-y-6 rounded-2xl border border-slate-100 bg-white p-8 text-slate-600 shadow-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Thu thập thông tin</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Ứng dụng có thể lưu thông tin tài khoản (email, tên hiển thị), dữ liệu dự án/task và log hoạt
            động phục vụ vận hành. Không bán dữ liệu cá nhân cho bên thứ ba trong phạm vi demo nội bộ.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">2. Cookie & phiên đăng nhập</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Phiên làm việc và token xác thực được dùng để duy trì đăng nhập an toàn. Bạn có thể đăng xuất
            bất cứ lúc nào từ sidebar.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">3. Bảo mật</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Nên triển khai HTTPS, rotation token, và giới hạn quyền truy cập cơ sở dữ liệu trên môi trường
            production. Mật khẩu được băm theo chuẩn backend của bạn.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">4. Quyền của người dùng</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Người dùng có thể yêu cầu chỉnh sửa hoặc xóa tài khoản thông qua quản trị viên — quy trình cụ
            thể do đội vận hành quy định.
          </p>
        </section>
        <p className="text-sm text-slate-500">
          Cần hỗ trợ?{" "}
          <Link href="/contact" className="font-medium text-blue-600 hover:underline">
            Liên hệ
          </Link>
        </p>
      </article>

      <SiteFooter />
    </section>
  );
}
