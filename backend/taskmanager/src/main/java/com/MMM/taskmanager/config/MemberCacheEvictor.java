package com.MMM.taskmanager.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Xóa cache member cũ (sau khi sửa mapper) để tránh trả userName/avatar null từ Redis.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MemberCacheEvictor implements ApplicationRunner {

    private static final List<String> MEMBER_CACHES = List.of(
            "members:project",
            "members:project:v2",
            "members:statistic",
            "members:statistic:v2"
    );

    private final CacheManager cacheManager;

    @Override
    public void run(ApplicationArguments args) {
        for (String name : MEMBER_CACHES) {
            var cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
                log.info("Cleared member cache: {}", name);
            }
        }
    }
}
