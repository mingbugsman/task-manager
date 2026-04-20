package com.MMM.taskmanager.service;


import com.MMM.taskmanager.dto.response.auth.TokenResponse;


public interface AuthService {
    void registerUser(String userName, String email, String password);
    void verifyRegisterOtp(String email, String otp);
    TokenResponse authenticateUser(String username, String password);
    TokenResponse refreshToken(String refreshToken);
    void logoutOneDevice(String token);
    void logoutAllDevice(Long userId);
    void forgotPassword(String email);
    void resetPassword(String email, String otp, String newPassword);

}
