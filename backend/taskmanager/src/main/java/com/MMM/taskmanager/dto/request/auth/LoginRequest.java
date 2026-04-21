package com.MMM.taskmanager.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class LoginRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email của người dùng", example = "user@example.com")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Schema(description = "Password của người dùng")
    private String password;
}
