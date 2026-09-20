package com.cybertrace.backend.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.RiskZone;

@Repository
public interface RiskZoneRepository extends JpaRepository<RiskZone, UUID> {

    List<RiskZone> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT rz FROM RiskZone rz
        WHERE rz.name = :name
          AND rz.predictionWindowEnd >= :now
        ORDER BY rz.predictionWindowEnd DESC
        """)
    List<RiskZone> findActiveZonesByName(@Param("name") String name, @Param("now") OffsetDateTime now);

    @Query(value = """
        SELECT rz.* FROM risk_zones rz
        WHERE ST_Contains(rz.geometry::geometry, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))
        ORDER BY rz.risk_score DESC
        """, nativeQuery = true)
    List<RiskZone> findZonesContainingPoint(@Param("lon") double lon, @Param("lat") double lat);
}

