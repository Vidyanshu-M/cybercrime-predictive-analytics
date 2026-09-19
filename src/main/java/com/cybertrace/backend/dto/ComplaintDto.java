package com.cybertrace.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ComplaintDto {

    public record CreateComplaintRequest(
        @NotBlank(message = "Complaint number is required")
        String complaintNumber,

        @NotBlank(message = "Crime category is required")
        String crimeCategory,

        @NotNull(message = "Fraud amount is required")
        @PositiveOrZero(message = "Fraud amount must be positive or zero")
        BigDecimal fraudAmount,

        String state,
        String district,
        String policeStation,
        Double longitude,
        Double latitude
    ) {}

    public record ComplaintResponse(
        UUID id,
        String complaintNumber,
        OffsetDateTime reportedAt,
        String crimeCategory,
        BigDecimal fraudAmount,
        String state,
        String district,
        String policeStation,
        Double longitude,
        Double latitude,
        String status
    ) {}
}
