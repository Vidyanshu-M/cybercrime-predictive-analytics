package com.cybertrace.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.AlertDto.AlertResponse;
import com.cybertrace.backend.dto.AtmDto.AtmResponse;
import com.cybertrace.backend.dto.DashboardDto.SummaryResponse;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.AlertRepository;
import com.cybertrace.backend.repository.AtmRepository;
import com.cybertrace.backend.repository.CaseRepository;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.RiskZoneRepository;

@Service
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final AlertRepository alertRepository;
    private final CaseRepository caseRepository;
    private final RiskZoneRepository riskZoneRepository;
    private final AtmRepository atmRepository;
    private final DtoMapper mapper;

    public DashboardService(ComplaintRepository complaintRepository,
                            AlertRepository alertRepository,
                            CaseRepository caseRepository,
                            RiskZoneRepository riskZoneRepository,
                            AtmRepository atmRepository,
                            DtoMapper mapper) {
        this.complaintRepository = complaintRepository;
        this.alertRepository = alertRepository;
        this.caseRepository = caseRepository;
        this.riskZoneRepository = riskZoneRepository;
        this.atmRepository = atmRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public SummaryResponse getSummary() {
        long totalComplaints = complaintRepository.count();
        long activeAlerts = alertRepository.countByStatusIgnoreCase("NEW");
        long criticalHotspots = riskZoneRepository.count();
        long openCases = caseRepository.countByStatusIgnoreCase("OPEN");

        BigDecimal totalFraudAmount = complaintRepository.sumTotalFraudAmount();

        List<AlertResponse> recentAlerts = alertRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(mapper::toAlertResponse)
                .toList();

        List<AtmResponse> highRiskAtms = atmRepository.findByIsActiveTrue().stream()
                .limit(5)
                .map(mapper::toAtmResponse)
                .toList();

        return new SummaryResponse(
                totalComplaints,
                activeAlerts,
                criticalHotspots,
                openCases,
                totalFraudAmount,
                recentAlerts,
                highRiskAtms
        );
    }
}
