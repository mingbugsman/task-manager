package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.RefreshTokenService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${MMM.taskmanager.app.jwtRefreshExpirationMs}")
    Long refreshTokenDurationMs;

    final RedisTemplate<String, String> redisTemplate;
    final UserRepository userRepository;

    static final String REFRESH_TOKEN_KEY_PREFIX = "refreshToken:";
    static final String USER_REFRESH_TOKENS_SET_PREFIX = "user:refreshTokens:";


    @Override
    public void saveRefreshToken(String token, Long userId, long ttlMillis) {
        String key = REFRESH_TOKEN_KEY_PREFIX + token;

        redisTemplate.opsForValue().set(
                key,
                String.valueOf(userId),
                ttlMillis,
                TimeUnit.MILLISECONDS
        );

        String userSetKey = USER_REFRESH_TOKENS_SET_PREFIX + userId;
        redisTemplate.opsForSet().add(userSetKey, token);
        redisTemplate.expire(userSetKey, ttlMillis, TimeUnit.MILLISECONDS);
    }


    @Override
    public RefreshToken findByToken(String token) {
        String key = REFRESH_TOKEN_KEY_PREFIX + token;

        String userIdStr = redisTemplate.opsForValue().get(key);

        if (userIdStr == null) {
            throw new AppException(ErrorCode.TOKEN_MISSING);
        }

        Long userId = Long.parseLong(userIdStr);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return buildRefreshToken(user, token);
    }

    @Override
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String token = UUID.randomUUID().toString();

        // lưu Redis
        saveRefreshToken(token, userId, refreshTokenDurationMs);

        return buildRefreshToken(user, token);
    }


    // logout 1 device
    @Override
    public void deleteByToken(String token) {
        String key = REFRESH_TOKEN_KEY_PREFIX + token;

        String userIdStr = redisTemplate.opsForValue().get(key);

        if (userIdStr != null) {
            String userSetKey = USER_REFRESH_TOKENS_SET_PREFIX + userIdStr;
            redisTemplate.opsForSet().remove(userSetKey, token);
        }

        redisTemplate.delete(key);
    }

    // DELETE ALL (logout all devices)

    @Override
    public int deleteByUserId(Long userId) {
        String userSetKey = USER_REFRESH_TOKENS_SET_PREFIX + userId;

        var tokens = redisTemplate.opsForSet().members(userSetKey);

        if (tokens != null) {
            for (String token : tokens) {
                redisTemplate.delete(REFRESH_TOKEN_KEY_PREFIX + token);
            }
        }

        redisTemplate.delete(userSetKey);

        return tokens != null ? tokens.size() : 0;
    }


    private RefreshToken buildRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);

        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));

        return refreshToken;
    }
}