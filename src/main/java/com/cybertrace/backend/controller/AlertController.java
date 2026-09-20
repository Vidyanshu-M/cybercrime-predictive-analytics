package com.cybertrace.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.annotation.Auditable;
import com.cybertrace.backend.dto.AlertDto.AlertResponse;
import com.cybertrace.backend.dto.AlertDto.AssignAlertRequest;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.repository.UserRepository;
import com.cybertrace.backend.security.CustomUserDetails;
import com.cybertrace.backend.service.AlertService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    public AlertController(AlertService alertService, UserRepository userRepository) {
        this.alertService = alertService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<AlertResponse>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(alertService.getAlerts(status, riskLevel, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable UUID id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @Auditable(action = "ACKNOWLEDGE_ALERT", entityType = "ALERT")
    @PreAuthorize("hasAnyRole('ADMIN', 'I4C_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'BANK_OFFICER')")
    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }
        String ipAddress = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(alertService.acknowledgeAlert(id, currentUser, ipAddress));
    }

    @Auditable(action = "ASSIGN_ALERT", entityType = "ALERT")
    @PreAuthorize("hasAnyRole('ADMIN', 'I4C_OFFICER', 'STATE_OFFICER')")
    @PatchMapping("/{id}/assign")
    public ResponseEntity<AlertResponse> assignAlert(
            @PathVariable UUID id,
            @Valid @RequestBody AssignAlertRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }
        String ipAddress = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(alertService.assignAlert(id, request.officerId(), currentUser, ipAddress));
    }
}
