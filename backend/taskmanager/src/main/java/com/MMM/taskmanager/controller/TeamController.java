package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.response.team.TeamDirectoryResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/team")
@Tag(name = "Team", description = "Danh bạ cộng tác viên qua các dự án")
public class TeamController {

    TeamService teamService;

    @GetMapping("/directory")
    @Operation(
            summary = "Danh bạ team",
            description = "Gom thành viên làm chung từ các dự án user tham gia"
    )
    public ResponseEntity<ApiResponse<TeamDirectoryResponse>> getDirectory() {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getDirectory()));
    }
}
