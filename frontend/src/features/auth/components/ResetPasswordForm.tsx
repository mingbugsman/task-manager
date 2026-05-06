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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/Form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || ""; 

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromUrl, otp: "", newPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordRequest) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(values);
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      router.push("/login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Mã OTP không hợp lệ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm">
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
                  <FormControl><Input type="password" placeholder="******" disabled={isLoading} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>Xác nhận đổi mật khẩu</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}