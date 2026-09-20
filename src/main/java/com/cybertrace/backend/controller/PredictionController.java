package com.cybertrace.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.dto.PredictionDto.PredictionResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionRunRequest;
import com.cybertrace.backend.service.PredictionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping
    public ResponseEntity<Page<PredictionResponse>> getPredictions(
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(predictionService.getPredictions(riskLevel, pageable));
    }

    @PostMapping("/run")
    public ResponseEntity<PredictionResponse> runPredictionCycle(@Valid @RequestBody PredictionRunRequest request) {
        PredictionResponse response = predictionService.runPredictionCycle(request);
        return ResponseEntity.ok(response);
    }
}
