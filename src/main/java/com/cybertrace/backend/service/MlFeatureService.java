package com.cybertrace.backend.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;

import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.RiskZoneRepository;
import com.cybertrace.backend.repository.TransactionRepository;

@Service
public class MlFeatureService {

    private final ComplaintRepository complaintRepository;
    private final TransactionRepository transactionRepository;
    private final RiskZoneRepository riskZoneRepository;

    public MlFeatureService(
            ComplaintRepository complaintRepository,
            TransactionRepository transactionRepository,
            RiskZoneRepository riskZoneRepository) {

        this.complaintRepository = complaintRepository;
        this.transactionRepository = transactionRepository;
        this.riskZoneRepository = riskZoneRepository;
    }

    public MlFeatureVector buildFeatures(Atm atm, OffsetDateTime now) {

        double lon = atm.getLocation().getX();
        double lat = atm.getLocation().getY();

        // ---------------------------------------------------------
        // Temporal
        // ---------------------------------------------------------

        int hour = now.getHour();

        int dayOfWeek = now.getDayOfWeek().getValue() - 1;

        int isWeekend =
                (now.getDayOfWeek() == DayOfWeek.SATURDAY ||
                 now.getDayOfWeek() == DayOfWeek.SUNDAY)
                        ? 1
                        : 0;

        // ---------------------------------------------------------
        // Complaint features
        // ---------------------------------------------------------

        long complaintsLast1h =
                complaintRepository.countComplaintsNearPoint(
                        lon,
                        lat,
                        3000.0,
                        now.minusHours(1),
                        now);

        long complaintsLast6h =
                complaintRepository.countComplaintsNearPoint(
                        lon,
                        lat,
                        3000.0,
                        now.minusHours(6),
                        now);

        long complaintsLast24h =
                complaintRepository.countComplaintsNearPoint(
                        lon,
                        lat,
                        3000.0,
                        now.minusHours(24),
                        now);

        long complaints1km =
                complaintRepository.countComplaintsNearPoint(
                        lon,
                        lat,
                        1000.0,
                        now.minusHours(24),
                        now);

        long complaints3km =
                complaintsLast24h;

        // ---------------------------------------------------------
        // Withdrawal features
        // ---------------------------------------------------------

        long withdrawalsLast1h =
                transactionRepository.countWithdrawalsAtAtm(
                        atm.getId(),
                        now.minusHours(1),
                        now);

        long withdrawalsLast6h =
                transactionRepository.countWithdrawalsAtAtm(
                        atm.getId(),
                        now.minusHours(6),
                        now);

        long withdrawalsLast24h =
                transactionRepository.countWithdrawalsAtAtm(
                        atm.getId(),
                        now.minusHours(24),
                        now);

        TransactionRepository.WithdrawalStatsProjection stats =
                transactionRepository.getWithdrawalStats(
                        atm.getId(),
                        now.minusHours(24),
                        now);

        long withdrawalCount = stats != null ? stats.getWithdrawalCount() : 0;

        BigDecimal totalAmount =
                (stats != null && stats.getTotalAmount() != null)
                        ? stats.getTotalAmount()
                        : BigDecimal.ZERO;

        long uniqueAccounts = stats != null ? stats.getUniqueAccounts() : 0;

        double totalWithdrawalAmount =
                totalAmount.doubleValue();

        double averageWithdrawal =
                withdrawalCount > 0
                        ? totalWithdrawalAmount / withdrawalCount
                        : 0.0;

        double transactionVelocity =
                withdrawalCount / 24.0;

        // ---------------------------------------------------------
        // Fraud / spatial features
        // ---------------------------------------------------------

        long fraudEvents1km =
                transactionRepository.countNearbyFraudTransactions(
                        lon,
                        lat,
                        1000.0,
                        now.minusHours(24),
                        now);

        long fraudEvents3km =
                transactionRepository.countNearbyFraudTransactions(
                        lon,
                        lat,
                        3000.0,
                        now.minusHours(24),
                        now);

        double distanceFromRecentFraud =
                transactionRepository.distanceFromRecentFraud(
                        lon,
                        lat,
                        now);

        long historicalFraudCount =
                transactionRepository.countHistoricalFraud(
                        atm.getId(),
                        now);

        // ---------------------------------------------------------
        // Risk-zone hotspot score (Integration approximation)
        // ---------------------------------------------------------

        double historicalHotspotScore =
                riskZoneRepository
                        .findZonesContainingPoint(lon, lat)
                        .stream()
                        .findFirst()
                        .map(zone -> zone.getRiskScore() != null ? zone.getRiskScore().doubleValue() : 0.0)
                        .orElse(0.0);

        return new MlFeatureVector(
                hour,
                dayOfWeek,
                isWeekend,

                complaintsLast1h,
                complaintsLast6h,
                complaintsLast24h,

                withdrawalsLast1h,
                withdrawalsLast6h,
                withdrawalsLast24h,

                withdrawalCount,
                totalWithdrawalAmount,
                averageWithdrawal,
                uniqueAccounts,
                transactionVelocity,

                complaints1km,
                complaints3km,

                fraudEvents1km,
                fraudEvents3km,

                distanceFromRecentFraud,
                historicalFraudCount,
                historicalHotspotScore
        );
    }
}
