package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.project_member.InviteMemberRequest;
import com.MMM.taskmanager.dto.request.project_member.UpdateMemberRoleRequest;
import com.MMM.taskmanager.dto.response.project_member.MemberStatisticResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.ProjectMember;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ProjectMemberMapper;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.impl.ProjectMemberServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectMemberServiceTest {
    @InjectMocks
    private ProjectMemberServiceImpl projectMemberService;

    @Mock private ProjectMemberRepository projectMemberRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectMemberMapper projectMemberMapper;

    // -------------------------------------------------------------------------
    // Dữ liệu dùng chung
    // -------------------------------------------------------------------------
    private Project mockProject;
    private User mockAdminUser;
    private User          mockLeadUser;
    private User          mockMemberUser;
    private ProjectMember mockAdmin;
    private ProjectMember mockLead;
    private ProjectMember mockMember;
    private ProjectMemberResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockProject = Project.builder()
                .projectId(1L)
                .build();

        mockAdminUser = User.builder().userId(1L).userName("Admin User").build();
        mockLeadUser  = User.builder().userId(2L).userName("Lead User").build();
        mockMemberUser = User.builder().userId(3L).userName("Member User").build();

        mockAdmin = ProjectMember.builder()
                .projectMemberId(1L)
                .project(mockProject)
                .user(mockAdminUser)
                .role("Admin")
                .joinedAt(LocalDateTime.now())
                .build();

        mockLead = ProjectMember.builder()
                .projectMemberId(2L)
                .project(mockProject)
                .user(mockLeadUser)
                .role("Lead")
                .joinedAt(LocalDateTime.now())
                .build();

        mockMember = ProjectMember.builder()
                .projectMemberId(3L)
                .project(mockProject)
                .user(mockMemberUser)
                .role("Member")
                .joinedAt(LocalDateTime.now())
                .build();

        mockResponse = ProjectMemberResponse.builder()
                .projectMemberId(1L)
                .projectId(1L)
                .user(UserSummaryResponse.builder()
                        .userId(1L)
                        .userName("Admin User")
                        .build())
                .role("Admin")
                .isManager(true)
                .joinedAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // GET MEMBERS
    // =========================================================================
    @Nested
    @DisplayName("getMembers()")
    class GetMembers {

        @Test
        @DisplayName("Thành công - trả về PageResponse danh sách member")
        void shouldReturnPageResponse() {
            Page<ProjectMember> mockPage = new PageImpl<>(
                    List.of(mockAdmin, mockMember), PageRequest.of(0, 20), 2
            );
            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findMembersByProjectId(eq(1L), isNull(), any()))
                    .thenReturn(mockPage);
            when(projectMemberMapper.toResponseDTO(any())).thenReturn(mockResponse);

            PageResponse<ProjectMemberResponse> result =
                    projectMemberService.getMembers(1L, null, 0, 20);

            assertThat(result.getItems()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            verify(projectMemberRepository).findMembersByProjectId(eq(1L), isNull(), any());
        }

        @Test
        @DisplayName("Thành công - filter theo role Admin")
        void shouldFilterByRole() {
            Page<ProjectMember> mockPage = new PageImpl<>(
                    List.of(mockAdmin), PageRequest.of(0, 20), 1
            );
            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findMembersByProjectId(eq(1L), eq("Admin"), any()))
                    .thenReturn(mockPage);
            when(projectMemberMapper.toResponseDTO(any())).thenReturn(mockResponse);

            PageResponse<ProjectMemberResponse> result =
                    projectMemberService.getMembers(1L, "Admin", 0, 20);

            assertThat(result.getItems()).hasSize(1);
            verify(projectMemberRepository).findMembersByProjectId(eq(1L), eq("Admin"), any());
        }

        @Test
        @DisplayName("Thất bại - role không hợp lệ -> ném AppException")
        void shouldThrowWhenRoleInvalid() {
            when(projectRepository.existsById(1L)).thenReturn(true);

            assertThatThrownBy(() ->
                    projectMemberService.getMembers(1L, "INVALID_ROLE", 0, 20))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("Thất bại - project không tồn tại -> ném AppException PROJECT_NOT_FOUND")
        void shouldThrowWhenProjectNotFound() {
            when(projectRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() ->
                    projectMemberService.getMembers(99L, null, 0, 20))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_NOT_FOUND));

            verify(projectMemberRepository, never()).findMembersByProjectId(any(), any(), any());
        }
    }

    // =========================================================================
    // GET MEMBER STATISTIC
    // =========================================================================
    @Nested
    @DisplayName("getMemberStatistic()")
    class GetMemberStatistic {

        @Test
        @DisplayName("Thành công - tính đúng số lượng theo role")
        void shouldReturnCorrectStatistic() {
            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.countMembersByRoleGrouped(1L)).thenReturn(List.of(
                    new Object[]{"Admin",  2L},
                    new Object[]{"Lead",   1L},
                    new Object[]{"Member", 3L},
                    new Object[]{"Reviewer", 1L}
            ));

            MemberStatisticResponse result = projectMemberService.getMemberStatistic(1L);

            assertThat(result.getTotalMembers()).isEqualTo(7L);
            assertThat(result.getAdminCount()).isEqualTo(2L);
            assertThat(result.getLeadCount()).isEqualTo(1L);
            assertThat(result.getMemberCount()).isEqualTo(3L);
            assertThat(result.getViewerCount()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Thành công - project chưa có member -> tất cả = 0")
        void shouldReturnZeroWhenNoMembers() {
            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.countMembersByRoleGrouped(1L)).thenReturn(List.of());

            MemberStatisticResponse result = projectMemberService.getMemberStatistic(1L);

            assertThat(result.getTotalMembers()).isZero();
            assertThat(result.getAdminCount()).isZero();
        }
    }

    // =========================================================================
    // INVITE MEMBER
    // =========================================================================
    @Nested
    @DisplayName("inviteMember()")
    class InviteMember {

        @Test
        @DisplayName("Thành công - ADMIN mời LEAD")
        void shouldInviteWhenAdminInvitesLead() {
            InviteMemberRequest request = new InviteMemberRequest(2L, "Lead");

            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(1L, 2L))
                    .thenReturn(false);
            when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
            when(userRepository.findById(2L)).thenReturn(Optional.of(mockLeadUser));
            when(projectMemberRepository.save(any())).thenReturn(mockLead);
            when(projectMemberMapper.toResponseDTO(mockLead)).thenReturn(mockResponse);

            ProjectMemberResponse result =
                    projectMemberService.inviteMember(1L, 1L, request);

            assertThat(result).isNotNull();
            verify(projectMemberRepository).save(any(ProjectMember.class));
        }

        @Test
        @DisplayName("Thành công - LEAD mời MEMBER")
        void shouldInviteWhenLeadInvitesMember() {
            InviteMemberRequest request = new InviteMemberRequest(3L, "Member");

            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L))
                    .thenReturn(Optional.of(mockLead));
            when(projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(1L, 3L))
                    .thenReturn(false);
            when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
            when(userRepository.findById(3L)).thenReturn(Optional.of(mockMemberUser));
            when(projectMemberRepository.save(any())).thenReturn(mockMember);
            when(projectMemberMapper.toResponseDTO(mockMember)).thenReturn(mockResponse);

            ProjectMemberResponse result =
                    projectMemberService.inviteMember(1L, 2L, request);

            assertThat(result).isNotNull();
            verify(projectMemberRepository).save(any(ProjectMember.class));
        }

        @Test
        @DisplayName("Thất bại - LEAD mời ADMIN -> ném AppException INVALID_INVITE")
        void shouldThrowWhenLeadInvitesAdmin() {
            InviteMemberRequest request = new InviteMemberRequest(1L, "Admin");

            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L))
                    .thenReturn(Optional.of(mockLead));

            assertThatThrownBy(() ->
                    projectMemberService.inviteMember(1L, 2L, request))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_MEMBER_INVALID_INVITE));

            verify(projectMemberRepository, never()).save(any());
        }

        @Test
        @DisplayName("Thất bại - user đã là member -> ném AppException ALREADY_EXISTS")
        void shouldThrowWhenUserAlreadyMember() {
            InviteMemberRequest request = new InviteMemberRequest(3L, "Member");

            when(projectRepository.existsById(1L)).thenReturn(true);
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(1L, 3L))
                    .thenReturn(true);

            assertThatThrownBy(() ->
                    projectMemberService.inviteMember(1L, 1L, request))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS));

            verify(projectMemberRepository, never()).save(any());
        }
    }

    // =========================================================================
    // UPDATE ROLE
    // =========================================================================
    @Nested
    @DisplayName("updateRole()")
    class UpdateRole {

        @Test
        @DisplayName("Thành công - ADMIN đổi role MEMBER thành LEAD")
        void shouldUpdateRoleSuccessfully() {
            UpdateMemberRoleRequest request = new UpdateMemberRoleRequest("Lead");

            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 3L))
                    .thenReturn(Optional.of(mockMember));
            when(projectMemberRepository.save(any())).thenReturn(mockMember);
            when(projectMemberMapper.toResponseDTO(any())).thenReturn(mockResponse);

            ProjectMemberResponse result =
                    projectMemberService.updateRole(1L, 1L, 3L, request);

            assertThat(result).isNotNull();
            verify(projectMemberRepository).save(any(ProjectMember.class));
        }

        @Test
        @DisplayName("Thất bại - LEAD đổi role -> ném AppException ACCESS_DENIED")
        void shouldThrowWhenLeadTriesToChangeRole() {
            UpdateMemberRoleRequest request = new UpdateMemberRoleRequest("Viewer");

            when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L))
                    .thenReturn(Optional.of(mockLead));

            assertThatThrownBy(() ->
                    projectMemberService.updateRole(1L, 2L, 3L, request))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_ACCESS_DENIED));

            verify(projectMemberRepository, never()).save(any());
        }

        @Test
        @DisplayName("Thất bại - ADMIN tự hạ role mình -> ném AppException ACCESS_DENIED")
        void shouldThrowWhenAdminDemotesHimself() {
            UpdateMemberRoleRequest request = new UpdateMemberRoleRequest("Member");

            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));

            assertThatThrownBy(() ->
                    projectMemberService.updateRole(1L, 1L, 1L, request))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_ACCESS_DENIED));
        }
    }

    // =========================================================================
    // KICK MEMBER
    // =========================================================================
    @Nested
    @DisplayName("kickMember()")
    class KickMember {

        @Test
        @DisplayName("Thành công - ADMIN kick MEMBER")
        void shouldKickSuccessfully() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 3L))
                    .thenReturn(Optional.of(mockMember));

            projectMemberService.kickMember(1L, 1L, 3L);

            verify(projectMemberRepository)
                    .deleteByProject_ProjectIdAndUser_UserId(1L, 3L);
        }

        @Test
        @DisplayName("Thành công - LEAD kick MEMBER")
        void shouldKickWhenLeadKicksMember() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L))
                    .thenReturn(Optional.of(mockLead));
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 3L))
                    .thenReturn(Optional.of(mockMember));

            projectMemberService.kickMember(1L, 2L, 3L);

            verify(projectMemberRepository)
                    .deleteByProject_ProjectIdAndUser_UserId(1L, 3L);
        }

        @Test
        @DisplayName("Thất bại - tự kick chính mình -> ném AppException")
        void shouldThrowWhenKickSelf() {
            assertThatThrownBy(() ->
                    projectMemberService.kickMember(1L, 1L, 1L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.MEMBER_CANNOT_KICK_THEMSELF));

            verify(projectMemberRepository, never())
                    .deleteByProject_ProjectIdAndUser_UserId(any(), any());
        }

        @Test
        @DisplayName("Thất bại - LEAD kick ADMIN -> ném AppException")
        void shouldThrowWhenLeadKicksAdmin() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L))
                    .thenReturn(Optional.of(mockLead));
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));

            assertThatThrownBy(() ->
                    projectMemberService.kickMember(1L, 2L, 1L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.MEMBER_CANNOT_KICK_ADMIN));

            verify(projectMemberRepository, never())
                    .deleteByProject_ProjectIdAndUser_UserId(any(), any());
        }

        @Test
        @DisplayName("Thất bại - member không tồn tại -> ném AppException MEMBER_NOT_FOUND")
        void shouldThrowWhenTargetNotFound() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 99L))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    projectMemberService.kickMember(1L, 1L, 99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_MEMBER_NOT_FOUND));
        }
    }

    // =========================================================================
    // LEAVE PROJECT
    // =========================================================================
    @Nested
    @DisplayName("leaveProject()")
    class LeaveProject {

        @Test
        @DisplayName("Thành công - MEMBER tự rời dự án")
        void shouldLeaveSuccessfully() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 3L))
                    .thenReturn(Optional.of(mockMember));

            projectMemberService.leaveProject(1L, 3L);

            verify(projectMemberRepository)
                    .deleteByProject_ProjectIdAndUser_UserId(1L, 3L);
        }

        @Test
        @DisplayName("Thành công - ADMIN rời khi còn ADMIN khác")
        void shouldLeaveWhenMultipleAdmins() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.countByProject_ProjectIdAndRole(1L, "Admin"))
                    .thenReturn(2L);

            projectMemberService.leaveProject(1L, 1L);

            verify(projectMemberRepository)
                    .deleteByProject_ProjectIdAndUser_UserId(1L, 1L);
        }

        @Test
        @DisplayName("Thất bại - ADMIN duy nhất rời -> ném AppException OWNER_CANNOT_LEAVE")
        void shouldThrowWhenLastAdminLeaves() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 1L))
                    .thenReturn(Optional.of(mockAdmin));
            when(projectMemberRepository.countByProject_ProjectIdAndRole(1L, "Admin"))
                    .thenReturn(1L);

            assertThatThrownBy(() ->
                    projectMemberService.leaveProject(1L, 1L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_OWNER_CANNOT_LEAVE));

            verify(projectMemberRepository, never())
                    .deleteByProject_ProjectIdAndUser_UserId(any(), any());
        }

        @Test
        @DisplayName("Thất bại - user không là member -> ném AppException MEMBER_NOT_FOUND")
        void shouldThrowWhenUserNotMember() {
            when(projectMemberRepository.findByProjectIdAndUserId(1L, 99L))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    projectMemberService.leaveProject(1L, 99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.PROJECT_MEMBER_NOT_FOUND));
        }
    }
}
