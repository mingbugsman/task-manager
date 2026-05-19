package com.MMM.taskmanager.dto.request.contact;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ContactMessageRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 120, message = "Họ tên tối đa 120 ký tự")
    @Schema(description = "Họ tên người gửi", example = "Nguyễn Văn A")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email để hỗ trợ phản hồi", example = "ban@email.com")
    private String email;

    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    @Schema(description = "Tiêu đề tin nhắn", example = "Góp ý tính năng")
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 5000, message = "Nội dung tối đa 5000 ký tự")
    @Schema(description = "Nội dung chi tiết")
    private String message;
}
