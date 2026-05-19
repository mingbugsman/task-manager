import Link from "next/link";
import { SiteFooter } from "./SiteFooter";

export function TermsView() {
  return (
    <section className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Điều khoản sử dụng</h1>
        <p className="mt-1 text-sm text-slate-500">Phiên bản mẫu — vui lòng soạn thảo pháp lý khi phát hành thật.</p>
      </header>

      <article className="max-w-none space-y-6 rounded-2xl border border-slate-100 bg-white p-8 text-slate-600 shadow-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Chấp nhận điều khoản</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Khi sử dụng TaskManager Pro Workspace, bạn đồng ý tuân thủ các điều khoản dưới đây và mọi quy
            định bổ sung do quản trị viên công bố.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">2. Tài khoản</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Mọi hoạt động dưới tài khoản của bạn được
            coi là do bạn thực hiện, trừ khi đã báo cáo trộm cắp tài khoản kịp thời.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">3. Nội dung & dữ liệu dự án</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Dữ liệu do người dùng tạo (task, bình luận, tệp đính kèm) thuộc quyền sở hữu của tổ chức/dự
            án tương ứng theo chính sách nội bộ. Không sử dụng dịch vụ cho mục đích vi phạm pháp luật.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">4. Dịch vụ demo</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Phiên bản demo có thể thay đổi, tạm ngưng hoặc xóa dữ liệu mà không cần báo trước. Không đảm
            bảo SLA cho môi trường học tập.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">5. Giới hạn trách nhiệm</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Trong phạm vi pháp luật cho phép, nhà phát triển không chịu trách nhiệm với thiệt hại gián
            tiếp do ngắt kết nối hoặc mất dữ liệu — nên sao lưu định kỳ khi dùng production.
          </p>
        </section>
        <p className="text-sm text-slate-500">
          Góp ý điều khoản:{" "}
          <Link href="/contact" className="font-medium text-blue-600 hover:underline">
            Liên hệ
          </Link>
        </p>
      </article>

      <SiteFooter />
    </section>
  );
}
