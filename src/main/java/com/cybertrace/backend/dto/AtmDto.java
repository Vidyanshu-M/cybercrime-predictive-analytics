package com.cybertrace.backend.dto;

import java.util.UUID;

public class AtmDto {

    public record CreateAtmRequest(
        String atmCode,
        String bankCode,
        double longitude,
        double latitude,
        String district,
        String area,
        String atmType
    ) {}

    public record AtmResponse(
        UUID id,
        String atmCode,
        String bankCode,
        String bankName,
        double longitude,
        double latitude,
        String district,
        String area,
        String atmType,
        boolean isActive
    ) {}
}