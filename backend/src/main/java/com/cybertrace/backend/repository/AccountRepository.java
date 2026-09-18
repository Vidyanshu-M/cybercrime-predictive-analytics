package com.cybertrace.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByTokenizedAccountRef(String tokenizedAccountRef);
}
