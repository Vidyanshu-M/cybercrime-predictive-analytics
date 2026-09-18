package com.cybertrace.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.dto.CaseDto.CaseDetailResponse;
import com.cybertrace.backend.dto.CaseDto.CaseResponse;
import com.cybertrace.backend.dto.CaseDto.CreateCaseRequest;
import com.cybertrace.backend.dto.CaseDto.EvidenceResponse;
import com.cybertrace.backend.dto.CaseDto.RegisterEvidenceRequest;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.repository.UserRepository;
import com.cybertrace.backend.security.CustomUserDetails;
import com.cybertrace.backend.service.CaseService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;
    private final UserRepository userRepository;

    public CaseController(CaseService caseService, UserRepository userRepository) {
        this.caseService = caseService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<CaseResponse>> getCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(caseService.getCases(status, priority, pageable));
    }

    @PostMapping
    public ResponseEntity<CaseResponse> createCase(
            @Valid @RequestBody CreateCaseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }
        String ipAddress = httpRequest.getRemoteAddr();
        CaseResponse created = caseService.createCase(request, currentUser, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDetailResponse> getCaseDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(caseService.getCaseDetail(id));
    }

    @PostMapping("/{id}/evidence")
    public ResponseEntity<EvidenceResponse> registerEvidence(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterEvidenceRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }
        String ipAddress = httpRequest.getRemoteAddr();
        EvidenceResponse response = caseService.registerEvidence(id, request, currentUser, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
