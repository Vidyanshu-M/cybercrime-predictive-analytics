package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

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

        @JsonProperty("hour")
        int hour,

        @JsonProperty("day_of_week")
        int dayOfWeek,

        @JsonProperty("is_weekend")
        int isWeekend,

        @JsonProperty("complaints_last_1h")
        long complaintsLast1h,

        @JsonProperty("complaints_last_6h")
        long complaintsLast6h,

        @JsonProperty("complaints_last_24h")
        long complaintsLast24h,

        @JsonProperty("withdrawals_last_1h")
        long withdrawalsLast1h,

        @JsonProperty("withdrawals_last_6h")
        long withdrawalsLast6h,

        @JsonProperty("withdrawals_last_24h")
        long withdrawalsLast24h,

        @JsonProperty("withdrawal_count")
        long withdrawalCount,

        @JsonProperty("total_withdrawal_amount")
        double totalWithdrawalAmount,

        @JsonProperty("average_withdrawal")
        double averageWithdrawal,

        @JsonProperty("unique_accounts")
        long uniqueAccounts,

        @JsonProperty("transaction_velocity")
        double transactionVelocity,

        @JsonProperty("complaints_1km")
        long complaints1km,

        @JsonProperty("complaints_3km")
        long complaints3km,

        @JsonProperty("fraud_events_1km")
        long fraudEvents1km,

        @JsonProperty("fraud_events_3km")
        long fraudEvents3km,

        @JsonProperty("distance_from_recent_fraud")
        double distanceFromRecentFraud,

        @JsonProperty("historical_fraud_count")
        long historicalFraudCount,

        @JsonProperty("historical_hotspot_score")
        double historicalHotspotScore
    ) {}

    public record FastApiPredictResponse(
        double probability,
        int riskScore,
        String riskLevel,
        String modelVersion,
        int predictionWindowMinutes,
        String atmId
    ) {}
}

