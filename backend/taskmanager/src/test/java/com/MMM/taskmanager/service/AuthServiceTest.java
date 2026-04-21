package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.UserDetailsImpl;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.security.jwt.JwtUtils;
import com.MMM.taskmanager.service.impl.AuthServiceImpl;
import com.MMM.taskmanager.service.impl.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private OtpService otpService;
    @Mock private RedisTemplate<String, String> redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private PasswordEncoder encoder;
    @Mock private JwtUtils jwtUtils;
    @Mock private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        // Gán giá trị giả cho biến @Value
        ReflectionTestUtils.setField(authService, "refreshTokenDurationMs", 86400000L);

        mockUser = User.builder()
                .userId(1L)
                .userName("test_user")
                .email("test@gmail.com")
                .passwordHash("hashed_password")
                .enabled(true)
                .build();
    }

    //  REGISTER TESTS

    @Test
    @DisplayName("Đăng ký thành công - Tạo user mới")
    void registerUser_Success_NewUser() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("hashed_password");

        authService.registerUser("Tan_dev", "test@gmail.com", "password123");

        verify(userRepository, times(1)).save(any(User.class));
        verify(otpService, times(1)).sendOtp("test@gmail.com");
    }

    @Test
    @DisplayName("Đăng ký thất bại - Email đã tồn tại và đã kích hoạt")
    void registerUser_Fail_EmailAlreadyExistsAndEnabled() {
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(mockUser));

        AppException exception = assertThrows(AppException.class, () ->
                authService.registerUser("Tan_dev", "test@gmail.com", "password123"));

        assertEquals(ErrorCode.USER_ALREADY_EXISTS, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    // VERIFY OTP TESTS

    @Test
    @DisplayName("Xác thực OTP thành công")
    void verifyRegisterOtp_Success() {
        String email = "test@gmail.com";
        String otp = "123456";
        String key = "otp:" + email;

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(otp);


        User unverifiedUser = User.builder().email(email).enabled(false).build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(unverifiedUser));

        authService.verifyRegisterOtp(email, otp);

        assertTrue(unverifiedUser.isEnabled());
        verify(userRepository).save(unverifiedUser);
        verify(redisTemplate).delete(key);
    }

    @Test
    @DisplayName("Xác thực OTP thất bại - Sai mã OTP")
    void verifyRegisterOtp_Fail_InvalidOtp() {
        String email = "test@gmail.com";
        String wrongOtp = "999999";
        String correctOtp = "123456";
        String key = "otp:" + email;

        // 1. Giả lập Redis trả về mã OTP đúng là 123456
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(correctOtp);


        AppException exception = assertThrows(AppException.class, () ->
                authService.verifyRegisterOtp(email, wrongOtp));

        // 3. Verify
        assertEquals(ErrorCode.OTP_INVALID, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
        verify(redisTemplate, never()).delete(anyString());
    }

    // LOGIN TESTS

    @Test
    @DisplayName("Đăng nhập thành công - Trả về Token Response")
    void authenticateUser_Success() {
        // 1. create token
        RefreshToken rtk = new RefreshToken();
        rtk.setToken(UUID.randomUUID().toString());

        // 2. Create Authentication và UserDetails
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl mockUserDetails = mock(UserDetailsImpl.class);

        when(mockUserDetails.getEmail()).thenReturn(mockUser.getEmail());
        when(auth.getPrincipal()).thenReturn(mockUserDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        // 3. Mock DB và JWT
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(jwtUtils.generateAccessTokenFromEmail(anyString())).thenReturn("mock-access-token");
        when(refreshTokenService.createRefreshToken(mockUser.getUserId())).thenReturn(rtk);

        // 4. Act
        TokenResponse result = authService.authenticateUser(mockUser.getEmail(), "password123");

        // 5. Assert
        assertNotNull(result);
        assertEquals("mock-access-token", result.accessToken());
        assertEquals(rtk.getToken(), result.refreshToken());


        verify(refreshTokenService).saveRefreshToken(eq(rtk.getToken()), eq(mockUser.getUserId()), eq(86400000L));
    }

    // FORGOT PASSWORD TEST
    @Test
    @DisplayName("Quên mật khẩu thất bại - Email không tồn tại trong hệ thống")
    void forgotPassword_Fail_UserNotFound() {
        String fakeEmail = "notfound@gmail.com";

        // Giả lập DB không tìm thấy ai có email này
        when(userRepository.findByEmail(fakeEmail)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () ->
                authService.forgotPassword(fakeEmail));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());

        // Đảm bảo không có OTP nào được gửi đi
        verify(otpService, never()).sendOtp(anyString());
    }

    // LOGOUT TEST
    @Test
    @DisplayName("Đăng xuất 1 thiết bị thành công")
    void logoutOneDevice_Success() {
        String token = "valid-refresh-token";

        // Act
        authService.logoutOneDevice(token);

        verify(refreshTokenService, times(1)).deleteByToken(token);
    }

    @Test
    @DisplayName("Đăng xuất tất cả thiết bị thành công")
    void logoutAllDevice_Success() {
        Long userId = 1L;

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        authService.logoutAllDevice(userId);

        verify(refreshTokenService, times(1)).deleteByUserId(userId);
    }
}