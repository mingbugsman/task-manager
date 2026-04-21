package com.MMM.taskmanager.service;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.service.impl.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private EmailService emailService;

    @InjectMocks private OtpService otpService;

    private final String email = "user@test.com";
    private final String cooldownKey = "otp_cooldown:" + email;
    private final String limitKey = "otp_limit:" + email;

    @BeforeEach
    void setUp() {
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }



    @Test
    @DisplayName("Failure - in cooldown 60s")
    void sendOtp_Fail_InCooldown() {
        when(stringRedisTemplate.hasKey(cooldownKey)).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> otpService.sendOtp(email));

        assertEquals(ErrorCode.OTP_TOO_MANY_REQUESTS, exception.getErrorCode());
        verify(emailService, never()).sendSimpleMessage(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Failure - exceed limit 5 times/day")
    void sendOtp_Fail_DailyLimitExceeded() {
        when(stringRedisTemplate.hasKey(cooldownKey)).thenReturn(false);
        when(valueOperations.get(limitKey)).thenReturn("5");

        AppException exception = assertThrows(AppException.class, () -> otpService.sendOtp(email));

        assertEquals(ErrorCode.OTP_DAILY_LIMIT_EXCEEDED, exception.getErrorCode());
        verify(emailService, never()).sendSimpleMessage(anyString(), anyString(), anyString());
    }


    @Test
    @DisplayName("Successfully - First try (init limit)")
    void sendOtp_Success_FirstTime() {
        when(stringRedisTemplate.hasKey(cooldownKey)).thenReturn(false);
        when(valueOperations.get(limitKey)).thenReturn(null);

        otpService.sendOtp(email);

        // 1. check email
        verify(emailService).sendSimpleMessage(eq(email), anyString(), contains("Your OTP is:"));

        // 2. Checking setup Cooldown 60s
        verify(valueOperations).set(eq(cooldownKey), eq("true"), eq(60L), eq(TimeUnit.SECONDS));


        verify(valueOperations).set(eq(limitKey), eq("1"), any(Duration.class));
    }

    @Test
    @DisplayName("Success - Second try (incre limit)")
    void sendOtp_Success_IncrementLimit() {
        when(stringRedisTemplate.hasKey(cooldownKey)).thenReturn(false);
        when(valueOperations.get(limitKey)).thenReturn("1");

        otpService.sendOtp(email);

        verify(valueOperations).increment(limitKey);
    }

    @Test
    @DisplayName("sendActualEmail - Checking TTL of OTP")
    void sendActualEmail_CheckOtpTtl() {
        String otp = "123456";
        String otpKey = "otp:" + email;

        otpService.sendActualEmail(email, otp);

        verify(valueOperations).set(
                eq(otpKey),
                eq(otp),
                eq(5L),
                eq(TimeUnit.MINUTES)
        );
    }
}