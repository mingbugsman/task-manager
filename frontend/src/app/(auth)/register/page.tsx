import { Suspense } from "react";
import RegisterForm from "@/src/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-sm text-slate-500">Đang tải…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
