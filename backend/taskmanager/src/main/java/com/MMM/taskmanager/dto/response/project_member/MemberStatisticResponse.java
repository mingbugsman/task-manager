package com.MMM.taskmanager.dto.response.project_member;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * DTO thống kê thành viên - bổ sung vào response GET danh sách member.
 * Trả về cùng PageResponse<ProjectMemberResponseDTO> dưới dạng metadata.
 *
 * Dùng cho: GET /api/v1/projects/{project_id}/members
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberStatisticResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long totalMembers;
    private long adminCount;
    private long leadCount;
    private long memberCount;
    private long viewerCount;
}
