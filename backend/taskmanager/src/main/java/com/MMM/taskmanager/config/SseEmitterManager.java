package com.MMM.taskmanager.config;

import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class SseEmitterManager {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    private static final long SSE_TIMEOUT = 30*60*1000L;

    public SseEmitter createEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("SSE connected for userId=" + userId));
        } catch (IOException e) {
            log.error("Failed to send connected event for userId={}", userId, e);
        }

       // clean up when emitter completion/timeout/error
        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> {
            log.info("SSE timeout for userId={}", userId);
            removeEmitter(userId, emitter);
        });
        emitter.onError(e -> {
            log.error("SSE error for userId={}", userId, e);
            removeEmitter(userId, emitter);
        });

        log.info("SSE emitter created for userId={}, total connections={}",
                userId, emitters.getOrDefault(userId, List.of()).size());
        return emitter;
    }

    public void sendToUser(Long userId, NotificationResponse notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            log.debug("No SSE connection found for userId={}, skip push", userId);
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();

        userEmitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
            } catch (IOException e) {
                log.warn("Failed to send SSE to userId={}, marking as dead", userId);
                deadEmitters.add(emitter);
            }
        });

        if (!deadEmitters.isEmpty()) {
            userEmitters.removeAll(deadEmitters);
            log.info("Removed {} dead emitters for userId={}", deadEmitters.size(), userId);
        }
    }

    public void broadcastToAll(NotificationResponse response) {
        emitters.keySet().forEach(userId -> sendToUser(userId, response));
        log.info("Breadcasted notification to {} online users", emitters.size());
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);

        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
        log.info("SSE emitter removed for userId={}", userId);
    }
}
