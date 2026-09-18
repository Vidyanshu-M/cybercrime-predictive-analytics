package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class PredictionDto {

    public record PredictionRunRequest(
        @NotBlank(message = "atmId is required")
        String atmId,

        Integer predictionWindowMinutes
    ) {}

    public record PredictionWindow(
        OffsetDateTime start,
        OffsetDateTime end
    ) {}

    public record PredictionResponse(
        String atmId,
        double probability,
        int riskScore,
        String riskLevel,
        String modelVersion,
        PredictionWindow predictionWindow,
        List<String> reasons
    ) {}

    public record FastApiPredictRequest(
        String atmId,
        int hour,
        int complaints24h,
        int withdrawals6h,
        int nearbyFraud,
        double distance
    ) {}

    public record FastApiPredictResponse(
        double probability,
        int riskScore,
        String riskLevel,
        String modelVersion
    ) {}
}
