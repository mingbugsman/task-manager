package com.MMM.taskmanager.service;


import com.MMM.taskmanager.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {
    void saveRefreshToken(String token, Long userId, long ttlMillis);

    RefreshToken findByToken(String token);
    RefreshToken createRefreshToken(Long userId);
    void deleteByToken(String token);
    int deleteByUserId(Long userId);
}
