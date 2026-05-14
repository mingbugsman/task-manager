import { Suspense } from "react";
import ForgotPasswordForm from "@/src/features/auth/components/ForgotPasswordForm";

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center min-h-screen bg-gray-50 p-4">
            <Suspense fallback={<div className="text-center">Đang tải biểu mẫu...</div>}>
                <ForgotPasswordForm/>
            </Suspense>
        </div>
    )
}