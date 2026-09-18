package com.cybertrace.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.entity.AuditLog;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.repository.AuditLogRepository;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(User user, String action, String entityType, String entityId, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(user, action, entityType, entityId, ipAddress);
            auditLogRepository.save(auditLog);
            log.info("AUDIT: User [{}] performed [{}] on [{}:{}]",
                    user != null ? user.getEmail() : "SYSTEM", action, entityType, entityId);
        } catch (Exception ex) {
            log.error("Failed to write audit log entry: {}", ex.getMessage());
        }
    }
}
