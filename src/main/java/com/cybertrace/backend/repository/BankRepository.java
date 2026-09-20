package com.cybertrace.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Bank;

@Repository
public interface BankRepository extends JpaRepository<Bank, UUID> {
    Optional<Bank> findByBankCode(String bankCode);
}
