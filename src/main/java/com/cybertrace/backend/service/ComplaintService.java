package com.cybertrace.backend.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.ComplaintDto.ComplaintResponse;
import com.cybertrace.backend.dto.ComplaintDto.CreateComplaintRequest;
import com.cybertrace.backend.entity.Complaint;
import com.cybertrace.backend.exception.ResourceNotFoundException;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.ComplaintRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DtoMapper mapper;
    private final AuditService auditService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public ComplaintService(ComplaintRepository complaintRepository, DtoMapper mapper, AuditService auditService) {
        this.complaintRepository = complaintRepository;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getComplaints(String status, String district, String category, Pageable pageable) {
        return complaintRepository.findFilteredComplaints(status, district, category, pageable)
                .map(mapper::toComplaintResponse);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(UUID id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return mapper.toComplaintResponse(complaint);
    }

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request, String ipAddress) {
        Point location = null;
        if (request.longitude() != null && request.latitude() != null) {
            location = geometryFactory.createPoint(new Coordinate(request.longitude(), request.latitude()));
            location.setSRID(4326);
        }

        Complaint complaint = new Complaint();
        complaint.setComplaintNumber(request.complaintNumber());
        complaint.setReportedAt(OffsetDateTime.now());
        complaint.setCrimeCategory(request.crimeCategory());
        complaint.setFraudAmount(request.fraudAmount());
        complaint.setState(request.state());
        complaint.setDistrict(request.district());
        complaint.setPoliceStation(request.policeStation());
        complaint.setLocation(location);
        complaint.setStatus("NEW");

        Complaint saved = complaintRepository.save(complaint);

        auditService.logAction(null, "CREATE_COMPLAINT", "COMPLAINT", saved.getId().toString(), ipAddress);

        return mapper.toComplaintResponse(saved);
    }
}
