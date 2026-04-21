package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

import com.MMM.taskmanager.repository.RefreshTokenRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.RefreshTokenService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${MMM.taskmanager.app.jwtRefreshExpirationMs}")
    Long refreshTokenDurationMs;
    final RefreshTokenRepository refreshTokenRepository;
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

        RefreshToken refreshToken = buildRefreshToken(user, token);
        return refreshTokenRepository.save(refreshToken);
    }


    // logout 1 device
    @Override
    public void deleteByToken(String token) {
        String key = REFRESH_TOKEN_KEY_PREFIX + token;

        String userIdStr = redisTemplate.opsForValue().get(key);

        // if not finding token in redis, then it would be logout or outdated
        if (userIdStr == null || userIdStr.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String userSetKey = USER_REFRESH_TOKENS_SET_PREFIX + userIdStr;
        redisTemplate.opsForSet().remove(userSetKey, token);

        // delete this token
        redisTemplate.delete(key);
    }

    // DELETE ALL (logout all devices)

    @Override
    public int deleteByUserId(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String userSetKey = USER_REFRESH_TOKENS_SET_PREFIX + userId;
        var tokens = redisTemplate.opsForSet().members(userSetKey);

        if (tokens != null && !tokens.isEmpty()) {
            List<String> keysToDelete = tokens.stream()
                    .map(token -> REFRESH_TOKEN_KEY_PREFIX + token)
                    .collect(Collectors.toList());

            redisTemplate.delete(keysToDelete);

            redisTemplate.delete(userSetKey);

            return tokens.size();
        }

        return 0;
    }

    private RefreshToken buildRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);

        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        return refreshToken;
    }
}