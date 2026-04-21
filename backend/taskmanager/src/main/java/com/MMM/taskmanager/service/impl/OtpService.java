package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate stringRedisTemplate;
    private final EmailService emailService;

    private static final int MAX_OTP_PER_DAY = 5;
    private static final int COOLDOWN_SECONDS = 60;

    public void sendOtp(String email) {
        String cooldownKey = "otp_cooldown:" + email;
        String limitKey = "otp_limit:" + email;


        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(cooldownKey))) {
            throw new AppException(ErrorCode.OTP_TOO_MANY_REQUESTS);
        }
        String countStr = stringRedisTemplate.opsForValue().get(limitKey);
        Integer dailyCount = countStr != null ? Integer.parseInt(countStr) : null;

        // 2. Checking limit
        if (dailyCount != null && dailyCount >= MAX_OTP_PER_DAY) {
            throw new AppException(ErrorCode.OTP_DAILY_LIMIT_EXCEEDED);
        }

        // 3. send OTP (Email/SMS logic...)
        String otp = generateOtp();
        sendActualEmail(email, otp);

        stringRedisTemplate.opsForValue().set(cooldownKey, "true", COOLDOWN_SECONDS, TimeUnit.SECONDS);
        // 4. store state
        // exec sendActualEmail

        // inc limit key
        if (dailyCount == null) {
            stringRedisTemplate.opsForValue().set(limitKey, "1", Duration.ofDays(1));
        } else {
            stringRedisTemplate.opsForValue().increment(limitKey);
        }
    }

    public void sendActualEmail(String email, String otp) {

        String key = "otp:" + email;
        emailService.sendSimpleMessage(
                email,
                "Verify your account",
                "Your OTP is: " + otp
        );

        stringRedisTemplate.opsForValue().set(key,otp, 5, TimeUnit.MINUTES);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
