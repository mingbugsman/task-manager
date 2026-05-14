import { Suspense } from "react";
import ResetPasswordForm from "@/src/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center min-h-screen bg-gray-50 p-4">
            <Suspense fallback={<div className="text-center">Đang tải biểu mẫu...</div>}>
                <ResetPasswordForm/>
            </Suspense>
        </div>
    )
}