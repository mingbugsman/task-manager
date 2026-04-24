package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.user.UserUpdateRequest;
import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;

import com.MMM.taskmanager.dto.response.util.PageResponse;

public interface UserService {
    PageResponse<UserResponse> getUsers(int page, int size, String sortBy);
    UserDetailResponse getUser(Long userId);
    UserDetailResponse updateUserProfile(UserUpdateRequest request);
    UserDetailResponse getMe();
    void createUserForAdmin();
    void setStatusUser(String userId);
    void deleteForeverUser(String userId);
}
