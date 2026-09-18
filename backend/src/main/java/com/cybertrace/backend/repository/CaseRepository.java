package com.cybertrace.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.CaseEntity;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, UUID> {

    Optional<CaseEntity> findByCaseNumber(String caseNumber);

    @EntityGraph(attributePaths = {"assignedOfficer"})
    @Query("""
        SELECT c FROM CaseEntity c
        WHERE (cast(:status as string) IS NULL OR LOWER(c.status) = LOWER(cast(:status as string)))
          AND (cast(:priority as string) IS NULL OR UPPER(c.priority) = UPPER(cast(:priority as string)))
        ORDER BY c.createdAt DESC
        """)
    Page<CaseEntity> findFilteredCases(@Param("status") String status,
                                      @Param("priority") String priority,
                                      Pageable pageable);

    @EntityGraph(attributePaths = {"assignedOfficer", "complaints", "transactions", "evidenceList"})
    @Query("SELECT c FROM CaseEntity c WHERE c.id = :id")
    Optional<CaseEntity> findWithFullDetailsById(@Param("id") UUID id);

    long countByStatusIgnoreCase(String status);
}
