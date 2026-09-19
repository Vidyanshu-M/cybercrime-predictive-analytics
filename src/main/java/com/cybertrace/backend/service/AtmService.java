package com.cybertrace.backend.service;

import java.util.List;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.AtmDto.AtmResponse;
import com.cybertrace.backend.dto.AtmDto.CreateAtmRequest;
import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.entity.Bank;
import com.cybertrace.backend.exception.ResourceNotFoundException;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.AtmRepository;
import com.cybertrace.backend.repository.BankRepository;

@Service
public class AtmService {

    private final AtmRepository atmRepository;
    private final BankRepository bankRepository;
    private final DtoMapper mapper;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public AtmService(AtmRepository atmRepository, BankRepository bankRepository, DtoMapper mapper) {
        this.atmRepository = atmRepository;
        this.bankRepository = bankRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AtmResponse> getAllAtms() {
        return atmRepository.findAll().stream()
                .map(mapper::toAtmResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AtmResponse> getNearbyAtms(double lon, double lat, double radiusMeters, int limit) {
        return atmRepository.findNearbyAtms(lon, lat, radiusMeters, limit).stream()
                .map(mapper::toAtmResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Atm getAtmEntityByCode(String atmCode) {
        return atmRepository.findByAtmCode(atmCode)
                .orElseThrow(() -> new ResourceNotFoundException("ATM not found with code: " + atmCode));
    }

    @Transactional(readOnly = true)
    public AtmResponse getAtmByCode(String atmCode) {
        return mapper.toAtmResponse(getAtmEntityByCode(atmCode));
    }

    @Transactional
    public AtmResponse createAtm(CreateAtmRequest request) {
        Bank bank = null;
        if (request.bankCode() != null) {
            bank = bankRepository.findByBankCode(request.bankCode()).orElse(null);
        }

        Point location = geometryFactory.createPoint(new Coordinate(request.longitude(), request.latitude()));
        location.setSRID(4326);

        Atm atm = new Atm();
        atm.setAtmCode(request.atmCode());
        atm.setBank(bank);
        atm.setLocation(location);
        atm.setDistrict(request.district());
        atm.setArea(request.area());
        atm.setAtmType(request.atmType() != null ? request.atmType() : "STANDALONE");
        atm.setActive(true);

        Atm saved = atmRepository.save(atm);
        return mapper.toAtmResponse(saved);
    }
}