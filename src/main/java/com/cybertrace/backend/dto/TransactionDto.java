package com.cybertrace.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class TransactionDto {

    public record TransactionResponse(
        UUID id,
        String transactionReference,
        OffsetDateTime transactionTime,
        BigDecimal amount,
        String transactionType,
        String tokenizedAccountRef,
        String atmCode,
        Double longitude,
        Double latitude,
        String riskLabel
    ) {}
}
