package com.cybertrace.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.AlertDto.AlertResponse;
import com.cybertrace.backend.entity.Alert;
import com.cybertrace.backend.entity.Prediction;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.event.AlertCreatedEvent;
import com.cybertrace.backend.exception.ResourceNotFoundException;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.AlertRepository;
import com.cybertrace.backend.repository.UserRepository;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final DtoMapper mapper;
    private final ApplicationEventPublisher eventPublisher;
    private final AuditService auditService;

    public AlertService(AlertRepository alertRepository,
                        UserRepository userRepository,
                        DtoMapper mapper,
                        ApplicationEventPublisher eventPublisher,
                        AuditService auditService) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<AlertResponse> getAlerts(String status, String riskLevel, Pageable pageable) {
        return alertRepository.findFilteredAlerts(status, riskLevel, pageable)
                .map(mapper::toAlertResponse);
    }

    @Transactional(readOnly = true)
    public AlertResponse getAlertById(UUID id) {
        Alert alert = alertRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
        return mapper.toAlertResponse(alert);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getRecentAlerts() {
        return alertRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(mapper::toAlertResponse)
                .toList();
    }

    @Transactional
    public AlertResponse createAndBroadcastAlert(Prediction prediction, String alertType, String message) {
        Alert alert = new Alert();
        alert.setPrediction(prediction);
        alert.setAlertType(alertType);
        alert.setRiskScore(prediction.getRiskScore());
        alert.setRiskLevel(prediction.getRiskLevel());
        alert.setMessage(message);
        alert.setStatus("NEW");

        Alert saved = alertRepository.save(alert);
        AlertResponse response = mapper.toAlertResponse(saved);

        eventPublisher.publishEvent(new AlertCreatedEvent(response));
        log.info("Published AlertCreatedEvent for AlertId={}", saved.getId());

        return response;
    }

    @Transactional
    public AlertResponse acknowledgeAlert(UUID alertId, User currentUser, String ipAddress) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(OffsetDateTime.now());
        if (currentUser != null) {
            alert.setAssignedTo(currentUser);
        }

        Alert updated = alertRepository.save(alert);
        auditService.logAction(currentUser, "ACKNOWLEDGE_ALERT", "ALERT", alertId.toString(), ipAddress);

        return mapper.toAlertResponse(updated);
    }

    @Transactional
    public AlertResponse assignAlert(UUID alertId, UUID officerId, User currentUser, String ipAddress) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        alert.setAssignedTo(officer);
        alert.setStatus("ASSIGNED");

        Alert updated = alertRepository.save(alert);
        auditService.logAction(currentUser, "ASSIGN_ALERT", "ALERT", alertId.toString(), ipAddress);

        return mapper.toAlertResponse(updated);
    }
}
