package com.cybertrace.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Alert;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    @EntityGraph(attributePaths = {"prediction", "prediction.atm", "assignedTo"})
    @Query("""
        SELECT a FROM Alert a
        WHERE (cast(:status as string) IS NULL OR LOWER(a.status) = LOWER(cast(:status as string)))
          AND (cast(:riskLevel as string) IS NULL OR UPPER(a.riskLevel) = UPPER(cast(:riskLevel as string)))
        ORDER BY a.createdAt DESC
        """)
    Page<Alert> findFilteredAlerts(@Param("status") String status,
                                  @Param("riskLevel") String riskLevel,
                                  Pageable pageable);

    @EntityGraph(attributePaths = {"prediction", "prediction.atm", "assignedTo"})
    List<Alert> findTop10ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"prediction", "prediction.atm", "assignedTo"})
    Optional<Alert> findWithDetailsById(UUID id);

    long countByStatusIgnoreCase(String status);
}
