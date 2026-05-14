import LoginForm from "@/src/features/auth/components/LoginForm"

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <LoginForm/>
            </div>
        </div>
    )
}