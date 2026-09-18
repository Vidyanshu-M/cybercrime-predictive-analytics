package com.cybertrace.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public class CaseDto {

    public record CreateCaseRequest(
        @NotBlank(message = "Case number is required")
        String caseNumber,

        @NotBlank(message = "Title is required")
        String title,

        String priority,
        UUID assignedOfficerId,
        List<UUID> complaintIds,
        List<UUID> transactionIds
    ) {}

    public record CaseResponse(
        UUID id,
        String caseNumber,
        String title,
        String priority,
        String status,
        String assignedOfficerName,
        OffsetDateTime createdAt,
        int linkedComplaintsCount,
        int linkedTransactionsCount,
        int evidenceCount
    ) {}

    public record CaseDetailResponse(
        UUID id,
        String caseNumber,
        String title,
        String priority,
        String status,
        String assignedOfficerName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<ComplaintDto.ComplaintResponse> complaints,
        List<TransactionDto.TransactionResponse> transactions,
        List<EvidenceResponse> evidenceList
    ) {}

    public record RegisterEvidenceRequest(
        @NotBlank(message = "File name is required")
        String fileName,

        String fileType,

        @NotBlank(message = "Storage reference is required")
        String storageReference,

        String hash
    ) {}

    public record EvidenceResponse(
        UUID id,
        String fileName,
        String fileType,
        String storageReference,
        String uploadedByOfficer,
        OffsetDateTime uploadedAt,
        String hash
    ) {}
}
