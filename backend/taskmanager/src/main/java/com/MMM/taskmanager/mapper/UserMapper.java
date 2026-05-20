package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.request.user.UserForAdminRequest;
import com.MMM.taskmanager.dto.request.user.UserUpdateRequest;
import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.entity.ProjectMember;
import com.MMM.taskmanager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "Spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {


    @Mapping(target = "roleGlobal", source = "roleGlobal", defaultValue = "USER")
    User toEntity(UserForAdminRequest request);

    UserResponse toResponse(User user);

    UserDetailResponse toDetailResponse(User user);

    @Mapping(ignore = true, target = "avatarUrl")

    void updateUserFromDTO(UserForAdminRequest request, @MappingTarget User user);

    UserSummaryResponse toUserSummary(User user);
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "userName", source = "user.userName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    UserSummaryResponse toUserSummaryDTO(ProjectMember member);

}
