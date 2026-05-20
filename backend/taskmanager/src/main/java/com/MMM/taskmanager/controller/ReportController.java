package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.response.report.PersonalReportResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.entity.type.ReportPeriod;
import com.MMM.taskmanager.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Báo cáo tiến độ cá nhân")
public class ReportController {

    ReportService reportService;

    @GetMapping("/me")
    @Operation(summary = "Báo cáo công việc cá nhân", description = "Thống kê task được giao cho user hiện tại")
    public ResponseEntity<ApiResponse<PersonalReportResponse>> getPersonalReport(
            @RequestParam(defaultValue = "WEEK") String period) {
        ReportPeriod reportPeriod = ReportPeriod.fromParam(period);
        return ResponseEntity.ok(ApiResponse.ok(reportService.getPersonalReport(reportPeriod)));
    }
}
