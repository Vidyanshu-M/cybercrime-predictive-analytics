package com.cybertrace.backend.repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Complaint;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    Page<Complaint> findByStatusIgnoreCase(String status, Pageable pageable);

    Page<Complaint> findByDistrictIgnoreCase(String district, Pageable pageable);

    long countByStatusIgnoreCase(String status);

    @Query(value = """
        SELECT c.* FROM complaints c
        WHERE (cast(:status as text) IS NULL OR LOWER(c.status) = LOWER(cast(:status as text)))
          AND (cast(:district as text) IS NULL OR LOWER(c.district) = LOWER(cast(:district as text)))
          AND (cast(:crimeCategory as text) IS NULL OR LOWER(c.crime_category) = LOWER(cast(:crimeCategory as text)))
        ORDER BY c.reported_at DESC
        """,
        countQuery = """
        SELECT count(*) FROM complaints c
        WHERE (cast(:status as text) IS NULL OR LOWER(c.status) = LOWER(cast(:status as text)))
          AND (cast(:district as text) IS NULL OR LOWER(c.district) = LOWER(cast(:district as text)))
          AND (cast(:crimeCategory as text) IS NULL OR LOWER(c.crime_category) = LOWER(cast(:crimeCategory as text)))
        """,
        nativeQuery = true)
    Page<Complaint> findFilteredComplaints(@Param("status") String status,
                                          @Param("district") String district,
                                          @Param("crimeCategory") String crimeCategory,
                                          Pageable pageable);

    @Query(value = """
        SELECT count(*) FROM complaints c
        WHERE c.location IS NOT NULL
          AND ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)
          AND c.reported_at >= :since
        """, nativeQuery = true)
    long countComplaintsNearPoint(@Param("lon") double lon,
                                  @Param("lat") double lat,
                                  @Param("radiusMeters") double radiusMeters,
                                  @Param("since") OffsetDateTime since);

    @Query("SELECT COALESCE(SUM(c.fraudAmount), 0) FROM Complaint c")
    BigDecimal sumTotalFraudAmount();
}
