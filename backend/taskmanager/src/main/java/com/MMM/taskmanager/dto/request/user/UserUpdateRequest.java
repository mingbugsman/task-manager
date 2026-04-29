package com.MMM.taskmanager.dto.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UserUpdateRequest {
    @Schema(description = "username của người dùng", example = "mingbugsman")
    String userName;
    @Schema(description = "avatar của nguời dùng")
    MultipartFile avatar;
}
