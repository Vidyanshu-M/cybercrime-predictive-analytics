package com.cybertrace.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {

    public record SummaryResponse(
        long totalComplaints,
        long activeAlerts,
        long criticalHotspots,
        long openCases,
        BigDecimal totalFraudAmount,
        List<AlertDto.AlertResponse> recentAlerts,
        List<AtmDto.AtmResponse> highRiskAtms
    ) {}
}
