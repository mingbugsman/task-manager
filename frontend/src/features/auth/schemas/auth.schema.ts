import { email, z } from "zod"

export const loginSchema = z.object({
email: z.string()
  .min(1, "Email không được để trống")
  .pipe(z.email("Email không đúng định dạng")),
    password: z.string()
    .min(1, "Password không được để trống")
});

export const registerSchema = z.object({
  userName: z.string()
    .min(3, "Username phải từ 3 đến 20 ký tự")
    .max(20, "Username phải từ 3 đến 20 ký tự"),
  email: z.string()
    .min(1, "Email không được để trống")
    .pipe(email("Email không đúng định dạng")),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự và giới hạn 18 ký tự")
    .max(18, "Mật khẩu phải có ít nhất 6 ký tự và giới hạn 18 ký tự"),
});

export const verifyOtpSchema = z.object({
  email: z.string()
    .min(1, "Email không được để trống")
    .pipe(email("Email không đúng định dạng")),
  otp: z.string()
    .min(1, "Mã OTP không được để trống"),
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email không được để trống")
    .pipe(email("Email không đúng định dạng")),
  otp: z.string()
    .min(1, "Mã OTP không được để trống"),
  newPassword: z.string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;