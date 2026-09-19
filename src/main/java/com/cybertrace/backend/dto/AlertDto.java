package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class AlertDto {

    public record AlertResponse(
        UUID id,
        UUID predictionId,
        String atmCode,
        String alertType,
        int riskScore,
        String riskLevel,
        String message,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime acknowledgedAt,
        String assignedOfficerName,
        Double longitude,
        Double latitude
    ) {}

    public record AssignAlertRequest(
        @NotNull(message = "Officer ID is required")
        UUID officerId
    ) {}
}
