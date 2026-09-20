package com.cybertrace.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.dto.ComplaintDto.ComplaintResponse;
import com.cybertrace.backend.dto.ComplaintDto.CreateComplaintRequest;
import com.cybertrace.backend.service.ComplaintService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<Page<ComplaintResponse>> getComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String crimeCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(complaintService.getComplaints(status, district, crimeCategory, pageable));
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody CreateComplaintRequest request,
                                                             HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        ComplaintResponse created = complaintService.createComplaint(request, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
