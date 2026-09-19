package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AuditDto {

    public record AuditLogResponse(
        UUID id,
        String userEmail,
        String userName,
        String action,
        String entityType,
        String entityId,
        OffsetDateTime timestamp,
        String ipAddress
    ) {}
}
