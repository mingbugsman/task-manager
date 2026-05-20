package com.MMM.taskmanager.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);

    /**
     * Gửi tin liên hệ tới hòm thư hỗ trợ, đặt Reply-To là email người gửi để trả lời trực tiếp.
     */
    void sendContactInquiry(String inbox, String replyToEmail, String subject, String plainText);
}
