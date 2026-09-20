package com.cybertrace.backend.repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybertrace.backend.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByTransactionReference(String transactionReference);

    @EntityGraph(attributePaths = {"account", "atm", "complaint"})
    @Query(value = """
        SELECT t FROM Transaction t
        WHERE (cast(:riskLabel as string) IS NULL OR LOWER(t.riskLabel) = LOWER(cast(:riskLabel as string)))
          AND (cast(:transactionType as string) IS NULL OR LOWER(t.transactionType) = LOWER(cast(:transactionType as string)))
        ORDER BY t.transactionTime DESC
        """)
    Page<Transaction> findFilteredTransactions(@Param("riskLabel") String riskLabel,
                                              @Param("transactionType") String transactionType,
                                              Pageable pageable);

    @Query(value = """
        SELECT count(*) FROM transactions t
        WHERE t.atm_id = :atmId
          AND t.transaction_type = 'WITHDRAWAL'
          AND t.transaction_time >= :since
        """, nativeQuery = true)
    long countRecentWithdrawalsAtAtm(@Param("atmId") UUID atmId,
                                     @Param("since") OffsetDateTime since);

    @Query(value = """
        SELECT COUNT(*)
        FROM transactions t
        WHERE t.atm_id = :atmId
          AND t.transaction_type = 'WITHDRAWAL'
          AND t.transaction_time >= :since
          AND t.transaction_time <= :until
        """, nativeQuery = true)
    long countWithdrawalsAtAtm(@Param("atmId") UUID atmId,
                               @Param("since") OffsetDateTime since,
                               @Param("until") OffsetDateTime until);

    public interface WithdrawalStatsProjection {
        long getWithdrawalCount();
        BigDecimal getTotalAmount();
        long getUniqueAccounts();
    }

    @Query(value = """
        SELECT
            COUNT(*) AS withdrawal_count,
            COALESCE(SUM(t.amount), 0) AS total_amount,
            COUNT(DISTINCT t.account_id) AS unique_accounts
        FROM transactions t
        WHERE t.atm_id = :atmId
          AND t.transaction_type = 'WITHDRAWAL'
          AND t.transaction_time >= :since
          AND t.transaction_time <= :until
        """, nativeQuery = true)
    WithdrawalStatsProjection getWithdrawalStats(@Param("atmId") UUID atmId,
                                                @Param("since") OffsetDateTime since,
                                                @Param("until") OffsetDateTime until);

    @Query(value = """
        SELECT count(*) FROM transactions t
        WHERE t.risk_label = 'FRAUD'
          AND t.location IS NOT NULL
          AND ST_DWithin(t.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)
          AND t.transaction_time >= :since
          AND t.transaction_time <= :until
        """, nativeQuery = true)
    long countNearbyFraudTransactions(@Param("lon") double lon,
                                      @Param("lat") double lat,
                                      @Param("radiusMeters") double radiusMeters,
                                      @Param("since") OffsetDateTime since,
                                      @Param("until") OffsetDateTime until);

    @Query(value = """
        SELECT count(*) FROM transactions t
        WHERE t.risk_label = 'FRAUD'
          AND t.location IS NOT NULL
          AND ST_DWithin(t.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)
          AND t.transaction_time >= :since
        """, nativeQuery = true)
    long countNearbyFraudTransactions(@Param("lon") double lon,
                                      @Param("lat") double lat,
                                      @Param("radiusMeters") double radiusMeters,
                                      @Param("since") OffsetDateTime since);

    @Query(value = """
        SELECT COALESCE(
            MIN(
                ST_Distance(
                    t.location,
                    ST_SetSRID(
                        ST_MakePoint(:lon, :lat),
                        4326
                    )::geography
                ) / 1000.0
            ),
            99.0
        )
        FROM transactions t
        WHERE t.risk_label = 'FRAUD'
          AND t.location IS NOT NULL
          AND t.transaction_time <= :until
        """, nativeQuery = true)
    double distanceFromRecentFraud(@Param("lon") double lon,
                                   @Param("lat") double lat,
                                   @Param("until") OffsetDateTime until);

    @Query(value = """
        SELECT COUNT(*)
        FROM transactions t
        WHERE t.atm_id = :atmId
          AND t.risk_label = 'FRAUD'
          AND t.transaction_time <= :until
        """, nativeQuery = true)
    long countHistoricalFraud(@Param("atmId") UUID atmId,
                              @Param("until") OffsetDateTime until);
}

