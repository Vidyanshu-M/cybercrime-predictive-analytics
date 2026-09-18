package com.cybertrace.backend.mapper;

import org.springframework.stereotype.Component;

import com.cybertrace.backend.dto.AlertDto;
import com.cybertrace.backend.dto.AtmDto;
import com.cybertrace.backend.dto.CaseDto;
import com.cybertrace.backend.dto.ComplaintDto;
import com.cybertrace.backend.dto.RiskZoneDto;
import com.cybertrace.backend.dto.TransactionDto;
import com.cybertrace.backend.entity.Alert;
import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.entity.CaseEntity;
import com.cybertrace.backend.entity.Complaint;
import com.cybertrace.backend.entity.Evidence;
import com.cybertrace.backend.entity.RiskZone;
import com.cybertrace.backend.entity.Transaction;

@Component
public class DtoMapper {

    public AtmDto.AtmResponse toAtmResponse(Atm atm) {
        if (atm == null) return null;
        double lon = atm.getLocation() != null ? atm.getLocation().getX() : 0.0;
        double lat = atm.getLocation() != null ? atm.getLocation().getY() : 0.0;
        String bankCode = atm.getBank() != null ? atm.getBank().getBankCode() : null;
        String bankName = atm.getBank() != null ? atm.getBank().getName() : null;

        return new AtmDto.AtmResponse(
            atm.getId(),
            atm.getAtmCode(),
            bankCode,
            bankName,
            lon,
            lat,
            atm.getDistrict(),
            atm.getArea(),
            atm.getAtmType(),
            atm.isActive()
        );
    }

    public ComplaintDto.ComplaintResponse toComplaintResponse(Complaint complaint) {
        if (complaint == null) return null;
        Double lon = complaint.getLocation() != null ? complaint.getLocation().getX() : null;
        Double lat = complaint.getLocation() != null ? complaint.getLocation().getY() : null;

        return new ComplaintDto.ComplaintResponse(
            complaint.getId(),
            complaint.getComplaintNumber(),
            complaint.getReportedAt(),
            complaint.getCrimeCategory(),
            complaint.getFraudAmount(),
            complaint.getState(),
            complaint.getDistrict(),
            complaint.getPoliceStation(),
            lon,
            lat,
            complaint.getStatus()
        );
    }

    public TransactionDto.TransactionResponse toTransactionResponse(Transaction txn) {
        if (txn == null) return null;
        Double lon = txn.getLocation() != null ? txn.getLocation().getX() : null;
        Double lat = txn.getLocation() != null ? txn.getLocation().getY() : null;
        String accountRef = txn.getAccount() != null ? txn.getAccount().getTokenizedAccountRef() : null;
        String atmCode = txn.getAtm() != null ? txn.getAtm().getAtmCode() : null;

        return new TransactionDto.TransactionResponse(
            txn.getId(),
            txn.getTransactionReference(),
            txn.getTransactionTime(),
            txn.getAmount(),
            txn.getTransactionType(),
            accountRef,
            atmCode,
            lon,
            lat,
            txn.getRiskLabel()
        );
    }

    public AlertDto.AlertResponse toAlertResponse(Alert alert) {
        if (alert == null) return null;
        String atmCode = (alert.getPrediction() != null && alert.getPrediction().getAtm() != null)
                ? alert.getPrediction().getAtm().getAtmCode()
                : null;
        Double lon = null;
        Double lat = null;
        if (alert.getPrediction() != null && alert.getPrediction().getAtm() != null && alert.getPrediction().getAtm().getLocation() != null) {
            lon = alert.getPrediction().getAtm().getLocation().getX();
            lat = alert.getPrediction().getAtm().getLocation().getY();
        }
        String officerName = alert.getAssignedTo() != null ? alert.getAssignedTo().getName() : null;

        return new AlertDto.AlertResponse(
            alert.getId(),
            alert.getPrediction() != null ? alert.getPrediction().getId() : null,
            atmCode,
            alert.getAlertType(),
            alert.getRiskScore(),
            alert.getRiskLevel(),
            alert.getMessage(),
            alert.getStatus(),
            alert.getCreatedAt(),
            alert.getAcknowledgedAt(),
            officerName,
            lon,
            lat
        );
    }

    public CaseDto.CaseResponse toCaseResponse(CaseEntity c) {
        if (c == null) return null;
        String officer = c.getAssignedOfficer() != null ? c.getAssignedOfficer().getName() : null;
        int complaintsCount = c.getComplaints() != null ? c.getComplaints().size() : 0;
        int txnCount = c.getTransactions() != null ? c.getTransactions().size() : 0;
        int evidenceCount = c.getEvidenceList() != null ? c.getEvidenceList().size() : 0;

        return new CaseDto.CaseResponse(
            c.getId(),
            c.getCaseNumber(),
            c.getTitle(),
            c.getPriority(),
            c.getStatus(),
            officer,
            c.getCreatedAt(),
            complaintsCount,
            txnCount,
            evidenceCount
        );
    }

    public CaseDto.EvidenceResponse toEvidenceResponse(Evidence e) {
        if (e == null) return null;
        String officer = e.getUploadedBy() != null ? e.getUploadedBy().getName() : null;
        return new CaseDto.EvidenceResponse(
            e.getId(),
            e.getFileName(),
            e.getFileType(),
            e.getStorageReference(),
            officer,
            e.getUploadedAt(),
            e.getHash()
        );
    }

    public RiskZoneDto.RiskZoneResponse toRiskZoneResponse(RiskZone rz) {
        if (rz == null) return null;
        return new RiskZoneDto.RiskZoneResponse(
            rz.getId(),
            rz.getName(),
            rz.getGeometry(),
            rz.getRiskScore(),
            rz.getRiskLevel(),
            rz.getPredictionWindowStart(),
            rz.getPredictionWindowEnd(),
            rz.getCreatedAt()
        );
    }
}
