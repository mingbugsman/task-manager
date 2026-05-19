import Link from "next/link";

const links = [
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/help", label: "Trợ giúp" },
  { href: "/changelog", label: "Cập nhật" },
  { href: "/privacy", label: "Bảo mật" },
  { href: "/terms", label: "Điều khoản" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50/80 py-10">
      <section className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <p className="text-center text-sm text-slate-500 sm:text-left">
          © {new Date().getFullYear()} TaskManager Pro Workspace. Phát triển cho mục đích học tập & demo.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-blue-600">
              {l.label}
            </Link>
          ))}
        </nav>
      </section>
    </footer>
  );
}
