package com.cybertrace.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.RiskZoneDto.RiskZoneResponse;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.RiskZoneRepository;

@Service
public class MapService {

    private final RiskZoneRepository riskZoneRepository;
    private final DtoMapper mapper;

    public MapService(RiskZoneRepository riskZoneRepository, DtoMapper mapper) {
        this.riskZoneRepository = riskZoneRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<RiskZoneResponse> getAllRiskZones() {
        return riskZoneRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toRiskZoneResponse)
                .toList();
    }
}
