"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Bổ sung import Link từ Next.js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas/auth.schema";
import { authApi } from "../api/auth.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      await authApi.register(values);
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      
    } catch (error: any) {
      console.log("error: " + error.response);
      setApiError(
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
        <CardDescription className="text-center">
          Bắt đầu quản lý công việc hiệu quả hơn ngay hôm nay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: Ming De Bug" 
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
                    <Input 
                      type="password" 
                      placeholder="Tối thiểu 6 ký tự" 
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
              {isLoading ? "Đang khởi tạo..." : "Đăng ký ngay"}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      {/* Phần bổ sung các đường dẫn điều hướng */}
      <CardFooter className="flex flex-col space-y-4 mt-2">
        <div className="text-sm text-center text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link 
            href="/login" 
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Đăng nhập ngay
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