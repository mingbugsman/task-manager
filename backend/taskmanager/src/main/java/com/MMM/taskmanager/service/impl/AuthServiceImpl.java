package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.UserDetailsImpl;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.security.jwt.JwtUtils;
import com.MMM.taskmanager.service.AuthService;
import com.MMM.taskmanager.service.EmailService;
import com.MMM.taskmanager.service.RefreshTokenService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthServiceImpl implements AuthService {

    final AuthenticationManager authenticationManager;
    final UserRepository userRepository;
    final RedisTemplate<String, String> redisTemplate;
    final PasswordEncoder encoder;
    final JwtUtils jwtUtils;
    final RefreshTokenService refreshTokenService;
    final EmailService emailService;

    @Value("${MMM.taskmanager.app.jwtRefreshExpirationMs}")
    Long refreshTokenDurationMs;

    @Override
    public void registerUser(String userName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }
        User user = User.builder()
                .userName(userName)
                .email(email)
                .passwordHash(encoder.encode(password))
                .build();

        userRepository.save(user);

        String otp = generateOtp();
        String key = "otp:" + email;
        redisTemplate.opsForValue().set(key,otp, 5, TimeUnit.MINUTES);
        emailService.sendSimpleMessage(
                email,
                "Verify your account",
                "Your OTP is: " + otp
        );
    }

    @Override
    public void verifyRegisterOtp(String email, String otp) {
        String key = "otp:" + email;
        String storedOtp = redisTemplate.opsForValue().get(key);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setEnabled(true);
        redisTemplate.delete(key);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Override
    public TokenResponse authenticateUser(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByUserName(userDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. generate access token
        String accessToken = jwtUtils.generateTokenFromUsername(user.getUserName());
        // 2. generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserId());
        // 3. save rtk to redis
        refreshTokenService.saveRefreshToken(refreshToken.getToken(), user.getUserId(), refreshTokenDurationMs);

        return new TokenResponse(
                accessToken,
                refreshToken.getToken()
        );

    }

    @Override
    public TokenResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenService.findByToken(refreshToken);

        Long userId = token.getUser().getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtUtils.generateTokenFromUsername(user.getUserName());

        // rotation
        refreshTokenService.deleteByToken(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userId);
        return new TokenResponse(
                newAccessToken,
                newRefreshToken.getToken()
        );
    }

    @Override
    public void logoutOneDevice(String token) {
        refreshTokenService.deleteByToken(token);
    }

    @Override
    public void logoutAllDevice(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String otp = generateOtp();

        String key = "otp:" + email;

        redisTemplate.opsForValue().set(key, otp, 5, TimeUnit.MINUTES);

        emailService.sendSimpleMessage(
                email,
                "Reset password OTP",
                "Your OTP is: " + otp
        );
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        String key = "otp:" + email;
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);
        redisTemplate.delete(key);
    }
}
