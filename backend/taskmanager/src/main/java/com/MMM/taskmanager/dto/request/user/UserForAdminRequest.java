package com.MMM.taskmanager.dto.request.user;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UserForAdminRequest {
    String username;
    String email;
    String password;
    MultipartFile avatar;
    String roleGlobal;
    String status;
    boolean enabled;
}
