package com.MMM.taskmanager.service;


import com.MMM.taskmanager.entity.RefreshToken;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.repository.RefreshTokenRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    // --- HẰNG SỐ (Sử dụng đúng giá trị trong code thực tế của bạn) ---
    private static final String RTK_PREFIX = "refreshToken:";
    private static final String USER_SET_PREFIX = "user:refreshTokens:";
    private static final String SAMPLE_TOKEN = "sample_token_uuid";
    private static final Long SAMPLE_USER_ID = 1L;
    private static final long ONE_DAY_MS = 86400000L;

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private RedisTemplate<String, String> redisTemplate;
    @Mock private UserRepository userRepository;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private SetOperations<String, String> setOperations;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    // Biến instance để dùng chung trong các hàm test nếu cần thay đổi giá trị
    private String expectedKey;
    private String expectedSetKey;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", ONE_DAY_MS);
        expectedKey = RTK_PREFIX + SAMPLE_TOKEN;
        expectedSetKey = USER_SET_PREFIX + SAMPLE_USER_ID;
    }

    @Test
    @DisplayName("Save Refresh Token successfully - everything is good")
    void saveRefreshToken_Success() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        // Act
        refreshTokenService.saveRefreshToken(SAMPLE_TOKEN, SAMPLE_USER_ID, ONE_DAY_MS);

        // Assert (Verify)

        verify(valueOperations).set(
                eq(expectedKey),
                eq(String.valueOf(SAMPLE_USER_ID)),
                anyLong(),
                eq(TimeUnit.MILLISECONDS)
        );

        verify(setOperations).add(eq(expectedSetKey), eq(SAMPLE_TOKEN));


        verify(redisTemplate).expire(eq(expectedSetKey), eq(ONE_DAY_MS), eq(TimeUnit.MILLISECONDS));
    }

    @Test
    @DisplayName("Save Token unsuccessfully - Connection Error Redis")
    void saveRefreshToken_Fail_RedisError() {
        // Arrange
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("Redis is down"));

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
                refreshTokenService.saveRefreshToken(SAMPLE_TOKEN, SAMPLE_USER_ID, ONE_DAY_MS));


        verify(redisTemplate, never()).opsForSet();
    }

    @Test
    @DisplayName("Find by Token successfully")
    void findByToken_Success_ReturnNewRefreshToken() {
        User mockUser = User.builder().userId(SAMPLE_USER_ID).email("test@gmail.com").build();

        RefreshToken mockRefreshToken = RefreshToken.builder()
                .token(SAMPLE_TOKEN)
                .build();
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(expectedKey)).thenReturn(String.valueOf(SAMPLE_USER_ID));
        when(userRepository.findById(SAMPLE_USER_ID)).thenReturn(Optional.of(mockUser));

        RefreshToken foundRTK =  refreshTokenService.findByToken(SAMPLE_TOKEN);

        assertNotNull(foundRTK);
        assertEquals(SAMPLE_TOKEN, foundRTK.getToken());
        assertEquals(SAMPLE_USER_ID, foundRTK.getUser().getUserId());

        verify(valueOperations).get(expectedKey);
        verify(userRepository).findById(SAMPLE_USER_ID);
    }

    @Test
    @DisplayName("Find by Token Failed - Not found user")
    void findByToken_Failed_NotFoundUser() {

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(expectedKey)).thenReturn(String.valueOf(SAMPLE_USER_ID));
        when(userRepository.findById(SAMPLE_USER_ID)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () ->
                refreshTokenService.findByToken(SAMPLE_TOKEN));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findById(SAMPLE_USER_ID);
    }

    @Test
    @DisplayName("Create Refresh Token successfully - save DB and Redis")
    void createRefreshToken_Success() {
        // Arrange
        User user = User.builder().userId(SAMPLE_USER_ID).build();
        when(userRepository.findById(SAMPLE_USER_ID)).thenReturn(Optional.of(user));


        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);


        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        RefreshToken result = refreshTokenService.createRefreshToken(SAMPLE_USER_ID);


        assertNotNull(result);
        assertNotNull(result.getToken());
        assertEquals(SAMPLE_USER_ID, result.getUser().getUserId());

        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Create Token Failed - User không tồn tại")
    void createRefreshToken_Fail_UserNotFound() {
        when(userRepository.findById(SAMPLE_USER_ID)).thenReturn(Optional.empty());

        assertThrows(AppException.class, () -> refreshTokenService.createRefreshToken(SAMPLE_USER_ID));
    }

    @Test
    @DisplayName("Delete token successfully - Logout 1 device")
    void deleteByToken_Success() {


        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(expectedKey)).thenReturn(String.valueOf(SAMPLE_USER_ID));
        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        // Act
        refreshTokenService.deleteByToken(SAMPLE_TOKEN);

        // Assert
        verify(setOperations).remove(expectedSetKey, SAMPLE_TOKEN);
        verify(redisTemplate).delete(expectedKey);
    }

    @Test
    @DisplayName("Delete token failed - Token is not found in Redis")
    void deleteByToken_Fail_InvalidRequest() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        AppException ex = assertThrows(AppException.class, () -> refreshTokenService.deleteByToken(SAMPLE_TOKEN));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
    }

    @Test
    @DisplayName("Delete by user id successfully")
    void deleteByUserId_Success() {

        Set<String> tokens = Set.of("token1", "token2");

        when(userRepository.existsById(SAMPLE_USER_ID)).thenReturn(true);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.members(expectedSetKey)).thenReturn(tokens);

        // Act
        int deletedCount = refreshTokenService.deleteByUserId(SAMPLE_USER_ID);

        // Assert
        assertEquals(2, deletedCount);
        verify(redisTemplate, times(1)).delete(anyList());
        verify(redisTemplate, times(1)).delete(expectedSetKey);
    }

    @Test
    @DisplayName("Delete all token failed - User is existed but not found any token")
    void deleteByUserId_NoTokens() {
        when(userRepository.existsById(SAMPLE_USER_ID)).thenReturn(true);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.members(anyString())).thenReturn(Collections.emptySet());

        int result = refreshTokenService.deleteByUserId(SAMPLE_USER_ID);

        assertEquals(0, result);
        verify(redisTemplate, never()).delete(anyList());
    }

    @Test
    @DisplayName("Delete all token failed - User is not existed")
    void deleteByUserId_Fail_UserNotFound() {
        when(userRepository.existsById(SAMPLE_USER_ID)).thenReturn(false);

        assertThrows(AppException.class, () -> refreshTokenService.deleteByUserId(SAMPLE_USER_ID));
    }

}