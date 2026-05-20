package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.response.report.PersonalReportResponse;
import com.MMM.taskmanager.entity.type.ReportPeriod;

public interface ReportService {

    PersonalReportResponse getPersonalReport(ReportPeriod period);
}
