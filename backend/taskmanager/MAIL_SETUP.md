# Cấu hình gửi email (form Liên hệ & OTP)

Form **Liên hệ** gửi thư qua SMTP Gmail tới `support.taskmanager.hcmunre@gmail.com`. Tài khoản Gmail này phải bật **xác minh 2 bước**, rồi tạo **Mật khẩu ứng dụng** (App Password) dùng cho `MAIL_PASSWORD`.

## Biến môi trường (backend)

| Biến | Ý nghĩa | Gợi ý giá trị |
|------|---------|----------------|
| `MAIL_USERNAME` | Tài khoản SMTP (thường trùng email gửi) | `support.taskmanager.hcmunre@gmail.com` |
| `MAIL_PASSWORD` | Mật khẩu ứng dụng Gmail (16 ký tự, có dấu cách) | *(tạo trên Google Account → Bảo mật)* |
| `CONTACT_INBOX` | Hòm nhận tin liên hệ *(tùy chọn)* | Mặc định trùng `MAIL_USERNAME` nếu không set |

`application.yaml` đã đặt `spring.mail.host` / `port` cho Gmail (`smtp.gmail.com`, `587`).

## Kiểm tra nhanh

1. Set `MAIL_PASSWORD` trong môi trường chạy Spring Boot (IDE, Docker, hoặc file `.env` nếu bạn map sang process).
2. Khởi động lại backend.
3. Đăng nhập app → **Liên hệ** → gửi form → kiểm tra hộp thư đến (và thư mục spam nếu cần).

Nếu thiếu `MAIL_PASSWORD`, API trả lỗi `MAIL_NOT_CONFIGURED` và frontend hiển thị hướng dẫn.
