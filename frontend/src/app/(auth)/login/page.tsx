import { Suspense } from "react";
import LoginForm from "@/src/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-sm text-slate-500">Đang tải…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
