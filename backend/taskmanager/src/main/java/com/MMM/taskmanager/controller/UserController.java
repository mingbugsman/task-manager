package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.user.UserForAdminRequest;
import com.MMM.taskmanager.dto.request.user.UserUpdateRequest;
import com.MMM.taskmanager.dto.response.user.UserDetailResponse;
import com.MMM.taskmanager.dto.response.user.UserResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "User", description = "Quản lý người dùng: Đọc thông tin, cập nhật, thêm người dùng, xóa hoặc cập nhật trạng thái người dùng")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lấy danh sách người dùng (Phân trang)", description = "Dành cho Admin để quản lý danh sách User")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUsers(page, size, sortBy, search)));
    }

    @Operation(summary = "Lấy thông tin chi tiết một User bằng ID")
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUser(userId)));
    }

    @Operation(summary = "Lấy thông tin cá nhân của người dùng hiện tại (Me)", description = "Lấy từ Token")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getMe()));
    }

    @Operation(summary = "Cập nhật thông tin cá nhân", description = "Cho phép người dùng tự cập nhật thông tin và avatar")
    @PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateMe(@ModelAttribute @Valid UserUpdateRequest request) {
        userService.updateMe(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin cá nhân thành công"));
    }

    @Operation(summary = "Admin cập nhật thông tin User", description = "Admin có quyền sửa mọi thông tin của User qua ID")
    @PutMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateUserForAdmin(
            @PathVariable Long userId,
            @ModelAttribute UserForAdminRequest request) {
        userService.updateUserForAdmin(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Admin cập nhật User thành công"));
    }

    @Operation(summary = "Admin tạo User mới", description = "Admin tạo tài khoản trực tiếp kèm theo quyền và trạng thái")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createUserForAdmin(@ModelAttribute UserForAdminRequest request) {
        userService.createUserForAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Tạo User mới thành công"));
    }

    @Operation(summary = "Cập nhật trạng thái User", description = "Thay đổi trạng thái (ACTIVE, BANNED, v.v.)")
    @PatchMapping("/status")
    public ResponseEntity<ApiResponse<Void>> setStatusUser(
            @RequestParam Long userId,
            @RequestParam String status) {
        userService.setStatusUser(userId, status);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái người dùng thành công"));
    }

    @Operation(summary = "Xóa vĩnh viễn User", description = "Hành động này không thể hoàn tác")
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteForeverUser(@PathVariable Long userId) {
        userService.deleteForeverUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn người dùng"));
    }
}