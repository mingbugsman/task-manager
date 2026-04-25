package com.MMM.taskmanager.service.impl;

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
import com.MMM.taskmanager.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    CloudinaryService cloudinaryService;

    @Override
    public PageResponse<UserResponse> getUsers(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(sortBy).descending());
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserResponse> userDTOs = userPage.getContent().stream()
                .map(userMapper::toResponse).toList();

        return PageResponse.<UserResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .hasNext(userPage.hasNext())
                .items(userDTOs)
                .build();
    }

    @Override
    public UserDetailResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toDetailResponse(user);

    }

    @Override
    public UserDetailResponse getMe() {
        User foundUser = getYourAccount();
        return userMapper.toDetailResponse(foundUser);
    }

    @Override
    public void updateMe(UserUpdateRequest request) {
        User foundUser = getYourAccount();

        if (request.getUserName() != null && !request.getUserName().isBlank()) {
            foundUser.setUserName(request.getUserName());
        }

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
//            if (foundUser.getAvatarUrl() != null) {
//               // call delete cloudinary service delete old avatar file
//            }
           CloudinaryResponse cloudinaryResponse = cloudinaryService.uploadAvatar(request.getAvatar());
           foundUser.setAvatarUrl(cloudinaryResponse.url());
        }

        userRepository.save(foundUser);
    }

    @Override
    public void updateUserForAdmin(String userId, UserForAdminRequest request) {

    }

    @Override
    public void createUserForAdmin(UserForAdminRequest request) {

    }

    @Override
    public void setStatusUser(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

    }

    @Override
    public void deleteForeverUser(Long userId) {
        userRepository.deleteById(userId);
    }

    private User getYourAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
