package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.contact.ContactMessageRequest;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.service.ContactService;
import com.MMM.taskmanager.service.EmailService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactServiceImpl implements ContactService {

    /** Constructor chỉ inject bean này — không dùng @FieldDefaults(makeFinal) cho field @Value. */
    private final EmailService emailService;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${MMM.taskmanager.contact.inbox}")
    private String contactInbox;

    @Override
    public void submitContactMessage(ContactMessageRequest request) {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("Contact form submitted but MAIL_PASSWORD is not configured");
            throw new AppException(ErrorCode.MAIL_NOT_CONFIGURED);
        }

        Long userId = SecurityUtils.getCurrentUserId();
        String title = request.getSubject() != null && !request.getSubject().isBlank()
                ? request.getSubject().trim()
                : "Liên hệ từ ứng dụng";
        String emailSubject = "[TaskManager · Liên hệ] " + title;

        String body = buildBody(request, userId);

        try {
            emailService.sendContactInquiry(
                    contactInbox,
                    request.getEmail().trim(),
                    emailSubject,
                    body
            );
            log.info("Contact message sent to inbox from userId={} replyTo={}", userId, request.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send contact email: {}", ex.getMessage(), ex);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    private static String buildBody(ContactMessageRequest request, Long userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn có tin nhắn mới từ form Liên hệ TaskManager.\n\n");
        sb.append("— Thông tin người gửi —\n");
        sb.append("Họ tên: ").append(request.getName().trim()).append('\n');
        sb.append("Email (Reply-To): ").append(request.getEmail().trim()).append('\n');
        sb.append("Tài khoản đăng nhập (userId): ").append(userId).append("\n\n");
        sb.append("— Nội dung —\n");
        sb.append(request.getMessage().trim()).append('\n');
        return sb.toString();
    }
}
