"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../schemas/auth.schema";
import { ResetPasswordRequest } from "@/src/types/auth.types";
import { authApi } from "../api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormProcessingOverlay } from "@/components/ui/form-processing-overlay";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/Form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/src/lib/api-error";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || ""; 

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromUrl, otp: "", newPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordRequest) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await authApi.resetPassword(values);
      router.push("/login?reset=success");
    } catch (error: unknown) {
      setApiError(getApiErrorMessage(error, "Mã OTP không hợp lệ hoặc đã hết hạn."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative w-full max-w-md mx-auto shadow-sm overflow-hidden">
      <FormProcessingOverlay show={isLoading} message="Đang đổi mật khẩu..." />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tạo mật khẩu mới</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP (gửi về email)</FormLabel>
                  <FormControl><Input placeholder="123456" disabled={isLoading} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="******" disabled={isLoading} {...field} />
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
              {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}