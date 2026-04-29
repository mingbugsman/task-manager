package com.MMM.taskmanager.dto.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreateRequest {
    @NotBlank(message = "Username không được để trống")
    @Schema(description = "Username của người dùng")
    String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email của người dùng", example = "user@example.com")
    String email;

    @NotBlank(message = "Password không được để trống")
    @Schema(description = "Password của người dùng")
    String password;
    @NotBlank(message = "Trạng thái không được để trống")
    @Schema(description = "Trạng thái của người dùng")
    String status;
    @NotBlank(message = "Kích hoạt email không được để trống")
    @Schema(description = "Kích hoạt của người dùng")
    String enabled;
}
