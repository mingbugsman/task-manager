package com.MMM.taskmanager.dto.response.project;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAnalyticsResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int progressPercent;
    private long totalTasks;
    private long doneCount;
    private long inProgressCount;
    private long reviewCount;
    private long overdueCount;
    private long memberCount;
    private double avgTasksPerMember;

    private List<ChartPoint> progressOverTime;
    private List<StatusSlice> statusDistribution;
    private List<MemberPerformanceBar> memberPerformance;
    private List<MonthlyFlow> monthlyTaskFlow;
    private List<PriorityBar> priorityDistribution;
    private List<MemberCompletionRow> memberCompletions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartPoint implements Serializable {
        private String label;
        private long value;
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
    public static class MemberPerformanceBar implements Serializable {
        private Long userId;
        private String userName;
        private String avatarUrl;
        private long assignedCount;
        private long completedCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyFlow implements Serializable {
        private String label;
        private long createdCount;
        private long completedCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriorityBar implements Serializable {
        private String key;
        private String label;
        private long count;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberCompletionRow implements Serializable {
        private Long userId;
        private String userName;
        private String avatarUrl;
        private String role;
        private long assignedCount;
        private long completedCount;
        private int completionPercent;
    }
}
