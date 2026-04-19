package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    AuthenticationManager authenticationManager;
    UserRepository userRepository;
    PasswordEncoder encoder;
    JwtUtils jwtUtils;
    RefreshTokenService refreshTokenService;
    EmailService emailService;


    @Override
    public User registerUser(String userName, String email, String password) {
        return null;
    }

    @Override
    public TokenResponse authenticateUser(String username, String password) {
        return null;
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
    public void logoutUser(Long userId) {

    }

    @Override
    public void forgotPassword(String email) {

    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {

    }
}
