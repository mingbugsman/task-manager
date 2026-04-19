package com.MMM.taskmanager.service;


import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.entity.User;


public interface AuthService {
    User registerUser(String userName, String email, String password);
    TokenResponse authenticateUser(String username, String password);
    TokenResponse refreshToken(String refreshToken);
    void logoutUser(Long userId);
    void forgotPassword(String email);
    void resetPassword(String email, String otp, String newPassword);

}
