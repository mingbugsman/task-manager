"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProcessingOverlay } from "@/components/ui/form-processing-overlay";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/Form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/src/lib/api-error";


const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email không được để trống").pipe(z.email("Email không đúng định dạng")),
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      // Gửi OTP thành công -> Chuyển sang form Đặt lại mật khẩu kèm theo email
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative w-full max-w-md mx-auto shadow-sm overflow-hidden">
      <FormProcessingOverlay show={isLoading} message="Đang gửi mã OTP..." />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu?</CardTitle>
        <CardDescription className="text-center">Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email đã đăng ký</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {apiError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {apiError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}