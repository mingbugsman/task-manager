"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema } from "../schemas/auth.schema";
import { authApi } from "../api/auth.api";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProcessingOverlay } from "@/components/ui/form-processing-overlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/Form";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const returnUrl = searchParams.get("returnUrl")?.trim() ?? "";

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: emailFromUrl,
      otp: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof verifyOtpSchema>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await authApi.verifyOtp(values);
      // Xác thực thành công, đẩy về trang đăng nhập
      const loginQuery = new URLSearchParams({ verified: "true" });
      if (returnUrl) loginQuery.set("returnUrl", returnUrl);
      router.push(`/login?${loginQuery.toString()}`);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Mã OTP không hợp lệ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative w-full max-w-md mx-auto shadow-sm overflow-hidden">
      <FormProcessingOverlay show={isLoading} message="Đang xác thực mã OTP..." />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Xác thực Email</CardTitle>
        <CardDescription className="text-center">
          Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến <br/>
          <strong>{emailFromUrl}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập mã 6 số..." disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {apiError && <div className="text-sm text-red-600">{apiError}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang kiểm tra..." : "Xác nhận"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}