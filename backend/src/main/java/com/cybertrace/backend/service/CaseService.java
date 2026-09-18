package com.cybertrace.backend.service;

import java.util.HashSet;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.CaseDto.CaseDetailResponse;
import com.cybertrace.backend.dto.CaseDto.CaseResponse;
import com.cybertrace.backend.dto.CaseDto.CreateCaseRequest;
import com.cybertrace.backend.dto.CaseDto.EvidenceResponse;
import com.cybertrace.backend.dto.CaseDto.RegisterEvidenceRequest;
import com.cybertrace.backend.entity.CaseEntity;
import com.cybertrace.backend.entity.Evidence;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.exception.ResourceNotFoundException;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.CaseRepository;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.EvidenceRepository;
import com.cybertrace.backend.repository.TransactionRepository;
import com.cybertrace.backend.repository.UserRepository;

@Service
public class CaseService {

    private final CaseRepository caseRepository;
    private final ComplaintRepository complaintRepository;
    private final TransactionRepository transactionRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final DtoMapper mapper;
    private final AuditService auditService;

    public CaseService(CaseRepository caseRepository,
                       ComplaintRepository complaintRepository,
                       TransactionRepository transactionRepository,
                       EvidenceRepository evidenceRepository,
                       UserRepository userRepository,
                       DtoMapper mapper,
                       AuditService auditService) {
        this.caseRepository = caseRepository;
        this.complaintRepository = complaintRepository;
        this.transactionRepository = transactionRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CaseResponse> getCases(String status, String priority, Pageable pageable) {
        return caseRepository.findFilteredCases(status, priority, pageable)
                .map(mapper::toCaseResponse);
    }

    @Transactional(readOnly = true)
    public CaseDetailResponse getCaseDetail(UUID id) {
        CaseEntity c = caseRepository.findWithFullDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with id: " + id));

        var complaints = c.getComplaints().stream().map(mapper::toComplaintResponse).toList();
        var transactions = c.getTransactions().stream().map(mapper::toTransactionResponse).toList();
        var evidence = c.getEvidenceList().stream().map(mapper::toEvidenceResponse).toList();
        String officer = c.getAssignedOfficer() != null ? c.getAssignedOfficer().getName() : null;

        return new CaseDetailResponse(
                c.getId(),
                c.getCaseNumber(),
                c.getTitle(),
                c.getPriority(),
                c.getStatus(),
                officer,
                c.getCreatedAt(),
                c.getUpdatedAt(),
                complaints,
                transactions,
                evidence
        );
    }

    @Transactional
    public CaseResponse createCase(CreateCaseRequest req, User currentUser, String ipAddress) {
        CaseEntity c = new CaseEntity();
        c.setCaseNumber(req.caseNumber());
        c.setTitle(req.title());
        c.setPriority(req.priority() != null ? req.priority() : "MEDIUM");
        c.setStatus("OPEN");

        if (req.assignedOfficerId() != null) {
            userRepository.findById(req.assignedOfficerId()).ifPresent(c::setAssignedOfficer);
        } else if (currentUser != null) {
            c.setAssignedOfficer(currentUser);
        }

        if (req.complaintIds() != null && !req.complaintIds().isEmpty()) {
            c.setComplaints(new HashSet<>(complaintRepository.findAllById(req.complaintIds())));
        }

        if (req.transactionIds() != null && !req.transactionIds().isEmpty()) {
            c.setTransactions(new HashSet<>(transactionRepository.findAllById(req.transactionIds())));
        }

        CaseEntity saved = caseRepository.save(c);
        auditService.logAction(currentUser, "CREATE_CASE", "CASE", saved.getId().toString(), ipAddress);

        return mapper.toCaseResponse(saved);
    }

    @Transactional
    public EvidenceResponse registerEvidence(UUID caseId, RegisterEvidenceRequest req, User currentUser, String ipAddress) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with id: " + caseId));

        Evidence evidence = new Evidence();
        evidence.setCaseEntity(caseEntity);
        evidence.setFileName(req.fileName());
        evidence.setFileType(req.fileType());
        evidence.setStorageReference(req.storageReference());
        evidence.setUploadedBy(currentUser);
        evidence.setHash(req.hash());

        Evidence saved = evidenceRepository.save(evidence);
        auditService.logAction(currentUser, "UPLOAD_EVIDENCE", "EVIDENCE", saved.getId().toString(), ipAddress);

        return mapper.toEvidenceResponse(saved);
    }
}
