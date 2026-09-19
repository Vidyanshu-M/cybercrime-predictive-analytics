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

import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.entity.Prediction;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, UUID> {

    @EntityGraph(attributePaths = {"atm"})
    Optional<Prediction> findTopByAtmOrderByPredictionTimeDesc(Atm atm);

    @EntityGraph(attributePaths = {"atm"})
    List<Prediction> findByAtmIdOrderByPredictionTimeDesc(UUID atmId);

    @EntityGraph(attributePaths = {"atm"})
    @Query("""
        SELECT p FROM Prediction p
        WHERE (:riskLevel IS NULL OR UPPER(p.riskLevel) = UPPER(:riskLevel))
        ORDER BY p.predictionTime DESC
        """)
    Page<Prediction> findFilteredPredictions(@Param("riskLevel") String riskLevel, Pageable pageable);

    long countByRiskLevelIgnoreCase(String riskLevel);
}
