package com.MMM.taskmanager.service;

import com.MMM.taskmanager.entity.ActivityLog;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.MMM.taskmanager.repository.ActivityLogRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Ghi nhật ký hoạt động nội bộ (không qua HTTP).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ActivityLogRecorder {

    ActivityLogRepository activityLogRepository;
    UserRepository userRepository;
    ProjectRepository projectRepository;

    public void record(
            String action,
            ActivityLogEntityType entityType,
            Long entityId,
            Long projectId,
            String metadata
    ) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return;
            }

            Project project = null;
            if (projectId != null) {
                project = projectRepository.findById(projectId).orElse(null);
            }

            activityLogRepository.save(ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .metadata(metadata)
                    .project(project)
                    .build());
        } catch (Exception ex) {
            log.warn("Không ghi được activity log: {}", ex.getMessage());
        }
    }

    public static String metadataJson(String... keyValues) {
        if (keyValues == null || keyValues.length == 0) {
            return null;
        }
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < keyValues.length; i += 2) {
            if (i > 0) {
                sb.append(',');
            }
            String key = keyValues[i];
            String value = i + 1 < keyValues.length ? keyValues[i + 1] : "";
            sb.append('"').append(escape(key)).append("\":\"")
                    .append(escape(value)).append('"');
        }
        sb.append('}');
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
