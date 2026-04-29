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
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthServiceImpl implements AuthService {

    final AuthenticationManager authenticationManager;
    final UserRepository userRepository;
    final OtpService otpService;
    final RedisTemplate<String, String> redisTemplate;
    final PasswordEncoder encoder;
    final JwtUtils jwtUtils;
    final RefreshTokenService refreshTokenService;


    @Value("${MMM.taskmanager.app.jwtRefreshExpirationMs}")
    Long refreshTokenDurationMs;

    @Override
    @Transactional
    public void registerUser(String userName, String email, String password) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isEnabled()) {
                // Đã kích hoạt rồi thì mới báo lỗi
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
            } else {
                existingUser.setUserName(userName);
                existingUser.setPasswordHash(encoder.encode(password));
                userRepository.save(existingUser);
            }
        } else {
            // Tạo mới hoàn toàn
            User newUser = User.builder()
                    .userName(userName)
                    .email(email)
                    .passwordHash(encoder.encode(password))
                    .build();
            userRepository.save(newUser);
        }

        otpService.sendOtp(email);
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
        userRepository.save(user);
        redisTemplate.delete(key);
    }



    @Override
    public TokenResponse authenticateUser(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. generate access token
        String accessToken = jwtUtils.generateTokenFromAuthentication(authentication);
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

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        String newAccessToken = jwtUtils.generateTokenFromAuthentication(authentication);

        // rotation
        refreshTokenService.deleteByToken(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(userId);
        return new TokenResponse(
                newAccessToken,
                newRefreshToken.getToken()
        );
    }

    @Override
    @Transactional
    public void logoutOneDevice(String token) {
        refreshTokenService.deleteByToken(token);
    }

    @Override
    @Transactional
    public void logoutAllDevice(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        refreshTokenService.deleteByUserId(userId);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        otpService.sendOtp(email);
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
