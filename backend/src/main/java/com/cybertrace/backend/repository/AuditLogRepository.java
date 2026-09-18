package com.cybertrace.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
