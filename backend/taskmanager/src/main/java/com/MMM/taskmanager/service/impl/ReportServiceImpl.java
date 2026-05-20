package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.report.PersonalReportResponse;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.type.ReportPeriod;
import com.MMM.taskmanager.repository.TaskRepository;
import com.MMM.taskmanager.service.ReportService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportServiceImpl implements ReportService {

    private static final String[] VN_DAYS = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};

    TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public PersonalReportResponse getPersonalReport(ReportPeriod period) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Task> tasks = taskRepository.findAllActiveAssignedToUserInMemberProjects(userId);

        LocalDate today = LocalDate.now();
        LocalDate periodStart = today.minusDays(period.getDays() - 1L);
        LocalDate prevStart = periodStart.minusDays(period.getDays());
        LocalDate prevEnd = periodStart.minusDays(1);

        LocalDateTime now = LocalDateTime.now();

        long total = tasks.size();
        long done = countByStatus(tasks, "done");
        long overdue = tasks.stream()
                .filter(t -> t.getDueAt() != null && t.getDueAt().isBefore(now))
                .filter(t -> !isDoneStatus(t.getStatus()))
                .count();
        int completionPercent = total == 0 ? 0 : (int) Math.round((double) done / total * 100);
        double avgDays = averageCompletionDays(tasks);

        long createdInPeriod = countCreatedBetween(tasks, periodStart, today);
        long createdPrev = countCreatedBetween(tasks, prevStart, prevEnd);
        long doneInPeriod = countCompletedBetween(tasks, periodStart, today);
        long donePrev = countCompletedBetween(tasks, prevStart, prevEnd);
        long overduePrev = countOverdueAsOf(tasks, prevEnd.atTime(23, 59, 59));

        return PersonalReportResponse.builder()
                .period(period.name())
                .summary(PersonalReportResponse.Summary.builder()
                        .totalTasks(total)
                        .completionPercent(completionPercent)
                        .overdueCount(overdue)
                        .avgCompletionDays(Math.round(avgDays * 10) / 10.0)
                        .totalTasksTrend(formatTrend(createdInPeriod, createdPrev, true))
                        .completionTrend(formatTrend(doneInPeriod, donePrev, true))
                        .overdueTrend(formatTrend(overdue, overduePrev, false))
                        .avgDaysTrend(formatDelta(avgDays, averageCompletionDaysInRange(tasks, prevStart, prevEnd)))
                        .build())
                .activityTrend(buildActivityTrend(tasks, period, today))
                .statusDistribution(buildStatusDistribution(tasks))
                .projectProgress(buildProjectProgress(tasks))
                .projectWorkload(buildProjectWorkload(tasks))
                .priorityDistribution(buildPriorityCards(tasks))
                .build();
    }

    private List<PersonalReportResponse.TrendPoint> buildActivityTrend(
            List<Task> tasks, ReportPeriod period, LocalDate today) {
        return switch (period) {
            case WEEK -> buildDailyTrend(tasks, today);
            case MONTH -> buildWeeklyBuckets(tasks, today, 4);
            case QUARTER -> buildWeeklyBuckets(tasks, today, 12);
        };
    }

    private List<PersonalReportResponse.TrendPoint> buildDailyTrend(List<Task> tasks, LocalDate today) {
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<PersonalReportResponse.TrendPoint> points = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day = monday.plusDays(i);
            points.add(PersonalReportResponse.TrendPoint.builder()
                    .label(VN_DAYS[i])
                    .createdCount(countCreatedOn(tasks, day))
                    .completedCount(countCompletedOn(tasks, day))
                    .build());
        }
        return points;
    }

    private List<PersonalReportResponse.TrendPoint> buildWeeklyBuckets(
            List<Task> tasks, LocalDate today, int bucketCount) {
        List<PersonalReportResponse.TrendPoint> points = new ArrayList<>();
        for (int i = bucketCount - 1; i >= 0; i--) {
            LocalDate bucketEnd = today.minusWeeks(i);
            LocalDate bucketStart = bucketEnd.minusDays(6);
            points.add(PersonalReportResponse.TrendPoint.builder()
                    .label("T" + (bucketCount - i))
                    .createdCount(countCreatedBetween(tasks, bucketStart, bucketEnd))
                    .completedCount(countCompletedBetween(tasks, bucketStart, bucketEnd))
                    .build());
        }
        return points;
    }

    private List<PersonalReportResponse.StatusSlice> buildStatusDistribution(List<Task> tasks) {
        long todo = countByStatus(tasks, "todo");
        long inProgress = countByStatus(tasks, "in progress");
        long review = countByStatus(tasks, "review");
        long done = countByStatus(tasks, "done");
        long total = tasks.size();

        List<PersonalReportResponse.StatusSlice> slices = new ArrayList<>();
        addSlice(slices, "Todo", "Chờ làm", todo, total, "#8B5CF6");
        addSlice(slices, "In Progress", "Đang làm", inProgress, total, "#3B82F6");
        addSlice(slices, "Review", "Đang review", review, total, "#A855F7");
        addSlice(slices, "Done", "Hoàn thành", done, total, "#22C55E");
        return slices.stream().filter(s -> s.getCount() > 0).toList();
    }

    private void addSlice(
            List<PersonalReportResponse.StatusSlice> slices,
            String status,
            String label,
            long count,
            long total,
            String color) {
        int percent = total == 0 ? 0 : (int) Math.round((double) count / total * 100);
        slices.add(PersonalReportResponse.StatusSlice.builder()
                .status(status)
                .label(label)
                .count(count)
                .percent(percent)
                .color(color)
                .build());
    }

    private List<PersonalReportResponse.ProjectProgressBar> buildProjectProgress(List<Task> tasks) {
        Map<Long, List<Task>> byProject = tasks.stream()
                .filter(t -> t.getProject() != null)
                .collect(Collectors.groupingBy(t -> t.getProject().getProjectId()));

        return byProject.entrySet().stream()
                .map(entry -> {
                    List<Task> projectTasks = entry.getValue();
                    long total = projectTasks.size();
                    long doneCount = projectTasks.stream().filter(t -> isDoneStatus(t.getStatus())).count();
                    int pct = total == 0 ? 0 : (int) Math.round((double) doneCount / total * 100);
                    Task sample = projectTasks.get(0);
                    return PersonalReportResponse.ProjectProgressBar.builder()
                            .projectId(entry.getKey())
                            .projectName(sample.getProject().getProjectName())
                            .progressPercent(pct)
                            .totalTasks(total)
                            .doneCount(doneCount)
                            .build();
                })
                .sorted(Comparator.comparing(PersonalReportResponse.ProjectProgressBar::getProgressPercent).reversed())
                .limit(8)
                .toList();
    }

    private List<PersonalReportResponse.ProjectWorkloadBar> buildProjectWorkload(List<Task> tasks) {
        Map<Long, List<Task>> byProject = tasks.stream()
                .filter(t -> t.getProject() != null)
                .collect(Collectors.groupingBy(t -> t.getProject().getProjectId()));

        return byProject.entrySet().stream()
                .map(entry -> {
                    List<Task> projectTasks = entry.getValue();
                    long completed = projectTasks.stream().filter(t -> isDoneStatus(t.getStatus())).count();
                    long inProgress = projectTasks.size() - completed;
                    Task sample = projectTasks.get(0);
                    return PersonalReportResponse.ProjectWorkloadBar.builder()
                            .projectId(entry.getKey())
                            .projectName(sample.getProject().getProjectName())
                            .completedCount(completed)
                            .inProgressCount(inProgress)
                            .build();
                })
                .sorted(Comparator.comparing(
                        PersonalReportResponse.ProjectWorkloadBar::getProjectName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .limit(8)
                .toList();
    }

    private List<PersonalReportResponse.PriorityCard> buildPriorityCards(List<Task> tasks) {
        long high = tasks.stream().filter(t -> t.getPriority() != null && t.getPriority() >= 3).count();
        long medium = tasks.stream().filter(t -> t.getPriority() != null && t.getPriority() == 2).count();
        long low = tasks.stream().filter(t -> t.getPriority() == null || t.getPriority() <= 1).count();
        long total = tasks.size();

        return List.of(
                buildPriority("high", "Cao", high, total, "#EF4444"),
                buildPriority("medium", "Trung bình", medium, total, "#F97316"),
                buildPriority("low", "Thấp", low, total, "#14B8A6")
        );
    }

    private PersonalReportResponse.PriorityCard buildPriority(
            String key, String label, long count, long total, String color) {
        int percent = total == 0 ? 0 : (int) Math.round((double) count / total * 100);
        return PersonalReportResponse.PriorityCard.builder()
                .key(key)
                .label(label)
                .count(count)
                .percent(percent)
                .color(color)
                .build();
    }

    private double averageCompletionDays(List<Task> tasks) {
        return tasks.stream()
                .filter(t -> isDoneStatus(t.getStatus()))
                .filter(t -> t.getCreatedAt() != null && t.getUpdatedAt() != null)
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getCreatedAt().toLocalDate(), t.getUpdatedAt().toLocalDate()))
                .average()
                .orElse(0);
    }

    private double averageCompletionDaysInRange(List<Task> tasks, LocalDate start, LocalDate end) {
        return tasks.stream()
                .filter(t -> isDoneStatus(t.getStatus()))
                .filter(t -> t.getUpdatedAt() != null)
                .filter(t -> {
                    LocalDate d = t.getUpdatedAt().toLocalDate();
                    return !d.isBefore(start) && !d.isAfter(end);
                })
                .filter(t -> t.getCreatedAt() != null)
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getCreatedAt().toLocalDate(), t.getUpdatedAt().toLocalDate()))
                .average()
                .orElse(0);
    }

    private long countCreatedOn(List<Task> tasks, LocalDate day) {
        return tasks.stream()
                .filter(t -> t.getCreatedAt() != null)
                .filter(t -> t.getCreatedAt().toLocalDate().equals(day))
                .count();
    }

    private long countCompletedOn(List<Task> tasks, LocalDate day) {
        return tasks.stream()
                .filter(t -> isDoneStatus(t.getStatus()))
                .filter(t -> t.getUpdatedAt() != null)
                .filter(t -> t.getUpdatedAt().toLocalDate().equals(day))
                .count();
    }

    private long countCreatedBetween(List<Task> tasks, LocalDate start, LocalDate end) {
        return tasks.stream()
                .filter(t -> t.getCreatedAt() != null)
                .filter(t -> {
                    LocalDate d = t.getCreatedAt().toLocalDate();
                    return !d.isBefore(start) && !d.isAfter(end);
                })
                .count();
    }

    private long countCompletedBetween(List<Task> tasks, LocalDate start, LocalDate end) {
        return tasks.stream()
                .filter(t -> isDoneStatus(t.getStatus()))
                .filter(t -> t.getUpdatedAt() != null)
                .filter(t -> {
                    LocalDate d = t.getUpdatedAt().toLocalDate();
                    return !d.isBefore(start) && !d.isAfter(end);
                })
                .count();
    }

    private long countOverdueAsOf(List<Task> tasks, LocalDateTime asOf) {
        return tasks.stream()
                .filter(t -> t.getDueAt() != null && t.getDueAt().isBefore(asOf))
                .filter(t -> !isDoneStatus(t.getStatus()))
                .count();
    }

    private long countByStatus(List<Task> tasks, String statusKey) {
        return tasks.stream()
                .filter(t -> t.getStatus() != null && t.getStatus().equalsIgnoreCase(statusKey))
                .count();
    }

    private boolean isDoneStatus(String status) {
        return status != null && status.equalsIgnoreCase("done");
    }

    private String formatTrend(long current, long previous, boolean higherIsBetter) {
        long diff = current - previous;
        if (diff == 0) {
            return "0";
        }
        boolean positive = higherIsBetter ? diff > 0 : diff < 0;
        String sign = diff > 0 ? "+" : "";
        if (!higherIsBetter && diff < 0) {
            return sign + diff;
        }
        return (positive ? "+" : "") + diff;
    }

    private String formatDelta(double current, double previous) {
        double diff = Math.round((current - previous) * 10) / 10.0;
        if (diff == 0) {
            return "0";
        }
        return (diff > 0 ? "+" : "") + diff;
    }
}
