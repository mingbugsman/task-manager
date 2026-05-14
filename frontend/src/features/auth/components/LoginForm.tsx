"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Bổ sung import Link
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, LoginFormValues } from "../schemas/auth.schema";


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

export default function LoginForm() {
  const router = useRouter();
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
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập email và mật khẩu để truy cập không gian làm việc
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    <Input 
                      type="password" 
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
            href="/register" 
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