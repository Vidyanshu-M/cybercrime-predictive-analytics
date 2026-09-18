package com.cybertrace.backend.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDto {

    public record CategoryCount(String category, long count) {}
    public record RiskLevelCount(String level, long count) {}
    public record DistrictHotspot(String district, long count, double totalAmount) {}

    public record AnalyticsOverviewResponse(
        List<CategoryCount> complaintsByCategory,
        List<RiskLevelCount> riskDistribution,
        List<DistrictHotspot> topDistricts,
        Map<String, Object> modelPerformanceMetrics
    ) {}
}
