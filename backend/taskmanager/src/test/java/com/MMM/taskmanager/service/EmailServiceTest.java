package com.MMM.taskmanager.service;

import com.MMM.taskmanager.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {
    @Mock private JavaMailSender mailSender;

    @InjectMocks private EmailServiceImpl emailService;

    private final String FROM_EMAIL = "system@taskmanager.com";

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(emailService, "fromEmail", FROM_EMAIL);
    }

    @Test
    @DisplayName("Send email successfully - Checking message content")
    void sendSimpleMessage_Success() {
        // 1. Arrange
        String to = "user@test.com";
        String subject = "Verify your account";
        String text = "Your OTP is: 123456";


        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // 2. Act
        emailService.sendSimpleMessage(to, subject, text);

        // 3. Assert (Verify and capture)

        verify(mailSender).send(messageCaptor.capture());


        SimpleMailMessage capturedMessage = messageCaptor.getValue();

        assertEquals(FROM_EMAIL, capturedMessage.getFrom());
        assertEquals(to, capturedMessage.getTo()[0]);
        assertEquals(subject, capturedMessage.getSubject());
        assertEquals(text, capturedMessage.getText());
    }

}
