"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { loginSchema, LoginFormValues } from "../schemas/auth.schema";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormProcessingOverlay } from "@/components/ui/form-processing-overlay";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"; 

export default function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl")?.trim() ?? "";
  const resetSuccess = searchParams.get("reset") === "success";
  const verified = searchParams.get("verified") === "true";
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Khởi tạo form với React Hook Form và Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setApiError(null);
    
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      setApiError(result.error);
      setIsLoading(false);
      return;
    }

    // Đợi session cookie được ghi xong rồi mới chuyển trang
    let session = await getSession();
    for (let i = 0; i < 5 && !session?.accessToken; i++) {
      await new Promise((r) => setTimeout(r, 200));
      session = await getSession();
    }

    const fallback = session?.isAdmin ? "/admin" : "/dashboard";
    const target =
      returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
        ? returnUrl
        : fallback;
    window.location.href = target;
  };

  return (
    <Card className="relative w-full max-w-md mx-auto shadow-sm overflow-hidden">
      <FormProcessingOverlay show={isLoading} message="Đang đăng nhập..." />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập email và mật khẩu để truy cập không gian làm việc
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetSuccess && (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Đổi mật khẩu thành công. Vui lòng đăng nhập lại.
          </p>
        )}
        {verified && !resetSuccess && (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Xác thực email thành công. Bạn có thể đăng nhập.
          </p>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" method="POST">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="user@example.com" 
                      type="email" 
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="******"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

       
            {apiError && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-md border border-red-200">
                {apiError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
      

      <CardFooter className="flex flex-col space-y-4 mt-2">
        <div className="text-sm text-center text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link 
            href={
              returnUrl
                ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
                : "/register"
            }
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
        
        <div className="text-sm text-center text-muted-foreground">
          <Link 
            href="/forgot-password" 
            className="hover:text-gray-900 hover:underline transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}