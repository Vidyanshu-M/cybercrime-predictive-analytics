package com.cybertrace.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cybertrace.backend.dto.RiskZoneDto.RiskZoneResponse;
import com.cybertrace.backend.service.MapService;

@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/risk-zones")
    public ResponseEntity<List<RiskZoneResponse>> getRiskZones() {
        return ResponseEntity.ok(mapService.getAllRiskZones());
    }
}
