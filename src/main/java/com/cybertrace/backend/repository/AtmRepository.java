package com.cybertrace.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Atm;

@Repository
public interface AtmRepository extends JpaRepository<Atm, UUID> {

    Optional<Atm> findByAtmCode(String atmCode);

    List<Atm> findByIsActiveTrue();

    List<Atm> findByDistrictIgnoreCase(String district);

    @Query(value = """
        SELECT a.* FROM atms a
        WHERE a.is_active = TRUE
          AND ST_DWithin(a.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)
        ORDER BY ST_Distance(a.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Atm> findNearbyAtms(@Param("lon") double lon,
                             @Param("lat") double lat,
                             @Param("radiusMeters") double radiusMeters,
                             @Param("limit") int limit);
}