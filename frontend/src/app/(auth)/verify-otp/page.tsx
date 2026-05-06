import { Suspense } from "react";
import VerifyOTPForm from "@/src/features/auth/components/VerifyOTPForm";

export default function VerifyOtpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
       
        <Suspense fallback={<div className="text-center">Đang tải biểu mẫu...</div>}>
          <VerifyOTPForm />
        </Suspense>
      </div>
    </div>
  );
}