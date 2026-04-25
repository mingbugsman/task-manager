package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.user.UserForAdminRequest;
import com.MMM.taskmanager.dto.request.user.UserUpdateRequest;
import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;

import com.MMM.taskmanager.dto.response.util.PageResponse;

public interface UserService {
    PageResponse<UserResponse> getUsers(int page, int size, String sortBy);
    UserDetailResponse getUser(Long userId);
    UserDetailResponse getMe();
    void updateMe(UserUpdateRequest request);
    void updateUserForAdmin(Long userId, UserForAdminRequest request);
    void createUserForAdmin(UserForAdminRequest request);
    void setStatusUser(Long userId, String status);
    void deleteForeverUser(Long userId);
}
