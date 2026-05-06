import RegisterForm from "@/src/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
} 