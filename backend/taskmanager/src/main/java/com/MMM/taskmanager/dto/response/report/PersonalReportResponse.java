package com.MMM.taskmanager.dto.response.report;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalReportResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String period;
    private Summary summary;
    private List<TrendPoint> activityTrend;
    private List<StatusSlice> statusDistribution;
    private List<ProjectProgressBar> projectProgress;
    private List<ProjectWorkloadBar> projectWorkload;
    private List<PriorityCard> priorityDistribution;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary implements Serializable {
        private long totalTasks;
        private int completionPercent;
        private long overdueCount;
        private double avgCompletionDays;
        private String totalTasksTrend;
        private String completionTrend;
        private String overdueTrend;
        private String avgDaysTrend;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendPoint implements Serializable {
        private String label;
        private long completedCount;
        private long createdCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusSlice implements Serializable {
        private String status;
        private String label;
        private long count;
        private int percent;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectProgressBar implements Serializable {
        private Long projectId;
        private String projectName;
        private int progressPercent;
        private long totalTasks;
        private long doneCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectWorkloadBar implements Serializable {
        private Long projectId;
        private String projectName;
        private long completedCount;
        private long inProgressCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriorityCard implements Serializable {
        private String key;
        private String label;
        private long count;
        private int percent;
        private String color;
    }
}
