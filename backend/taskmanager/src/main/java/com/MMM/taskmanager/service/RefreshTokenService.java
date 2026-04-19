package com.MMM.taskmanager.service;


import com.MMM.taskmanager.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken findByToken(String token);
    RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
    int deleteByUserId(Long userId);
}
