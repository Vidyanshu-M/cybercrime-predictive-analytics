package com.cybertrace.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.dto.AtmDto.AtmResponse;
import com.cybertrace.backend.dto.AtmDto.CreateAtmRequest;
import com.cybertrace.backend.service.AtmService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/atms")
public class AtmController {

    private final AtmService atmService;

    public AtmController(AtmService atmService) {
        this.atmService = atmService;
    }

    @GetMapping
    public ResponseEntity<List<AtmResponse>> getAtms(
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double lat,
            @RequestParam(defaultValue = "5000") Double radiusMeters,
            @RequestParam(defaultValue = "100") Integer limit) {
        if (lon != null && lat != null) {
            return ResponseEntity.ok(atmService.getNearbyAtms(lon, lat, radiusMeters, limit));
        }
        return ResponseEntity.ok(atmService.getAllAtms());
    }

    @GetMapping("/{code}")
    public ResponseEntity<AtmResponse> getAtmByCode(@PathVariable String code) {
        return ResponseEntity.ok(atmService.getAtmByCode(code));
    }

    @PostMapping
    public ResponseEntity<AtmResponse> createAtm(@Valid @RequestBody CreateAtmRequest request) {
        AtmResponse created = atmService.createAtm(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}