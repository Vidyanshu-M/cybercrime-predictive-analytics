package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Polygon;

public class RiskZoneDto {

    public record RiskZoneResponse(
        UUID id,
        String name,
        Polygon geometry,
        int riskScore,
        String riskLevel,
        OffsetDateTime predictionWindowStart,
        OffsetDateTime predictionWindowEnd,
        OffsetDateTime createdAt
    ) {}
}
