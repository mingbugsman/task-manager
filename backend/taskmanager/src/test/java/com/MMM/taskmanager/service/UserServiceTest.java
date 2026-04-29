package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.user.UserForAdminRequest;
import com.MMM.taskmanager.dto.request.user.UserUpdateRequest;
import com.MMM.taskmanager.dto.response.cloudinary.CloudinaryResponse;
import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.UserDetailsImpl;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.UserMapper;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.CloudinaryService;
import com.MMM.taskmanager.service.impl.UserServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setUserId(1L);
        mockUser.setUserName("Test User");
        mockUser.setEmail("test@gmail.com");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }


    @Test
    @DisplayName("getUser - Success: Return user after sucessfully found by id")
    void getUser_Success() {
        // Arrange
        Long userId = 1L;
        UserDetailResponse mockResponse = new UserDetailResponse();
        mockResponse.setUserName("Test User");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userMapper.toDetailResponse(mockUser)).thenReturn(mockResponse);

        // Act
        UserDetailResponse result = userService.getUser(userId);

        // Assert
        assertNotNull(result);
        assertEquals("Test User", result.getUserName());
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("getUser - Fail: Throw error when not found user")
    void getUser_UserNotFound_ThrowsException() {
        // Arrange
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> userService.getUser(userId));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userMapper, never()).toDetailResponse(any());
    }


    @Test
    @DisplayName("getUsers - Success: return PageResponse")
    void getUsers_Success() {
        // Arrange
        int page = 1;
        int size = 10;
        String sortBy = "userId";

        Pageable pageable = PageRequest.of(0, size, org.springframework.data.domain.Sort.by(sortBy).descending());
        Page<User> mockPage = new PageImpl<>(List.of(mockUser), pageable, 1);

        UserResponse mockUserResponse = new UserResponse();
        mockUserResponse.setUserName("Test User");

        when(userRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(userMapper.toResponse(mockUser)).thenReturn(mockUserResponse);

        // Act
        PageResponse<UserResponse> result = userService.getUsers(page, size, sortBy);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getCurrentPage());
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getItems().size());
        assertEquals("Test User", result.getItems().get(0).getUserName());
    }

    // ================== TEST CREATE USER FOR ADMIN ==================

    @Test
    @DisplayName("createUserForAdmin - Fail: Throw error user found - existed email")
    void createUserForAdmin_EmailExists_ThrowsException() {
        // Arrange
        UserForAdminRequest request = new UserForAdminRequest();
        request.setEmail("test@gmail.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> userService.createUserForAdmin(request));
        assertEquals(ErrorCode.USER_ALREADY_EXISTS, exception.getErrorCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUserForAdmin - Success: Create user with avatar")
    void createUserForAdmin_SuccessWithAvatar() {
        // Arrange
        UserForAdminRequest request = new UserForAdminRequest();
        request.setEmail("new@gmail.com");
        request.setUserName("New User");
        request.setPassword("password123");

        MultipartFile mockFile = mock(MultipartFile.class);
        request.setAvatar(mockFile);

        User mappedUser = new User();

        CloudinaryResponse cloudResponse = new CloudinaryResponse(
                "pub_id",
                "http://cloudinary.com/avatar.png",
                "jpg",
                1024L,
                "dummy"
        );

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(mappedUser);
        when(encoder.encode(request.getPassword())).thenReturn("hashedPassword");
        when(mockFile.isEmpty()).thenReturn(false);
        when(cloudinaryService.uploadAvatar(mockFile)).thenReturn(cloudResponse);

        // Act
        userService.createUserForAdmin(request);

        // Assert
        assertEquals("hashedPassword", mappedUser.getPasswordHash());
        assertEquals("http://cloudinary.com/avatar.png", mappedUser.getAvatarUrl());
        verify(userRepository, times(1)).save(mappedUser);
    }

    // ================== TEST GET ME (Mocking SecurityContext) ==================

    @Test
    @DisplayName("getMe - Success: return information logged-in user")
    void getMe_Success() {
        // Arrange
        mockSecurityContext(1L);

        UserDetailResponse mockResponse = new UserDetailResponse();
        mockResponse.setUserName("Test User");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userMapper.toDetailResponse(mockUser)).thenReturn(mockResponse);

        // Act
        UserDetailResponse result = userService.getMe();

        // Assert
        assertNotNull(result);
        assertEquals("Test User", result.getUserName());
    }

    // ================== HELPER METHOD ==================

    /**
     * Hàm hỗ trợ giả lập (mock) SecurityContextHolder để vượt qua hàm getYourAccount()
     */
    private void mockSecurityContext(Long userId) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(mockUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("updateMe - Success: Successfully update name and avatar")
    void updateMe_SuccessWithAvatar() {
        // Arrange
        mockSecurityContext(1L);

        User oldUser = new User();
        oldUser.setUserId(1L);
        oldUser.setUserName("Old Name");
        oldUser.setAvatarUrl("http://old-avatar.png");

        UserUpdateRequest request = new UserUpdateRequest();
        request.setUserName("Updated Name");

        MultipartFile mockFile = mock(MultipartFile.class);
        request.setAvatar(mockFile);

        CloudinaryResponse cloudResponse = new CloudinaryResponse(
                "new_pub_id",
                "http://new-avatar.png",
                "jpg",
                1024L,
                "dummy"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(oldUser));
        when(mockFile.isEmpty()).thenReturn(false);
        when(cloudinaryService.uploadAvatar(mockFile)).thenReturn(cloudResponse);

        // Act
        userService.updateMe(request);

        // Assert
        assertEquals("Updated Name", oldUser.getUserName());
        assertEquals("http://new-avatar.png", oldUser.getAvatarUrl());

        verify(cloudinaryService, times(1)).deleteFile("http://old-avatar.png");

        verify(userRepository, times(1)).save(oldUser);
    }

    @Test
    @DisplayName("updateUserForAdmin - Fail: Throw error user not found")
    void updateUserForAdmin_UserNotFound_ThrowsException() {
        // Arrange
        Long userId = 99L;
        UserForAdminRequest request = new UserForAdminRequest();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> userService.updateUserForAdmin(userId, request));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());

        verify(userRepository, never()).save(any());
        verify(cloudinaryService, never()).uploadAvatar(any());
    }

    @Test
    @DisplayName("updateUserForAdmin - Success: Admin update info without avatar")
    void updateUserForAdmin_SuccessWithoutAvatar() {
        // Arrange
        Long userId = 1L;
        UserForAdminRequest request = new UserForAdminRequest();
        request.setUserName("Admin Updated Name");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        doNothing().when(userMapper).updateUserFromDTO(request, mockUser);

        // Act
        userService.updateUserForAdmin(userId, request);

        // Assert
        verify(userMapper, times(1)).updateUserFromDTO(request, mockUser);
        verify(cloudinaryService, never()).uploadAvatar(any());
        verify(userRepository, times(1)).save(mockUser);
    }

    // ================== TEST SET STATUS ==================
    @Test
    @DisplayName("setStatusUser - Success: Successfully update status")
    void setStatusUser_Success() {
        // Arrange
        Long userId = 1L;
        String newStatus = "BANNED";

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.setStatusUser(userId, newStatus);
        // Assert
        assertEquals("BANNED", mockUser.getStatus());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    @DisplayName("deleteForeverUser - Success: Call function deleteById of Repository")
    void deleteForeverUser_Success() {
        // Arrange
        Long userId = 1L;

        // Act
        userService.deleteForeverUser(userId);

        // Assert
        verify(userRepository, times(1)).deleteById(userId);
    }
}