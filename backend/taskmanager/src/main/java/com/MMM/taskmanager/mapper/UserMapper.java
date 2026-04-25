package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;
import com.MMM.taskmanager.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "Spring")
public interface UserMapper {

    UserResponse toResponse(User user);
    UserDetailResponse toDetailResponse(User user);
}
