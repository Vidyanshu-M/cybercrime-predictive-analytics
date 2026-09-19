package com.cybertrace.backend.aspect;

import java.util.UUID;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.cybertrace.backend.annotation.Auditable;
import com.cybertrace.backend.dto.AlertDto.AlertResponse;
import com.cybertrace.backend.dto.CaseDto.CaseResponse;
import com.cybertrace.backend.dto.CaseDto.EvidenceResponse;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.repository.UserRepository;
import com.cybertrace.backend.security.CustomUserDetails;
import com.cybertrace.backend.service.AuditService;

import jakarta.servlet.http.HttpServletRequest;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;
    private final UserRepository userRepository;

    public AuditAspect(AuditService auditService, UserRepository userRepository) {
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @AfterReturning(value = "@annotation(auditable)", returning = "result")
    public void logAuditableAction(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            User currentUser = getCurrentUser();
            String ipAddress = getClientIp();
            String entityId = extractEntityId(joinPoint, result);

            auditService.logAction(
                    currentUser,
                    auditable.action(),
                    auditable.entityType(),
                    entityId,
                    ipAddress
            );
            log.info("AOP Audit recorded: Action [{}] on Entity [{}:{}] by User [{}]",
                    auditable.action(), auditable.entityType(), entityId,
                    currentUser != null ? currentUser.getEmail() : "ANONYMOUS/SYSTEM");
        } catch (Exception ex) {
            log.error("Failed to execute AOP audit logging: {}", ex.getMessage());
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userRepository.findById(userDetails.getId()).orElse(null);
        }
        return null;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    private String extractEntityId(JoinPoint joinPoint, Object result) {
        Object actualResult = result;
        if (result instanceof ResponseEntity<?> responseEntity) {
            actualResult = responseEntity.getBody();
        }

        if (actualResult instanceof CaseResponse c) {
            return c.id() != null ? c.id().toString() : null;
        } else if (actualResult instanceof AlertResponse a) {
            return a.id() != null ? a.id().toString() : null;
        } else if (actualResult instanceof EvidenceResponse e) {
            return e.id() != null ? e.id().toString() : null;
        }

        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof UUID uuid) {
                return uuid.toString();
            }
        }

        return "N/A";
    }
}
