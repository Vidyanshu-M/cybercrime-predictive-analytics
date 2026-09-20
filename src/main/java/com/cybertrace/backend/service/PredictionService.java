package com.cybertrace.backend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.PredictionDto.FastApiPredictRequest;
import com.cybertrace.backend.dto.PredictionDto.FastApiPredictResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionRunRequest;
import com.cybertrace.backend.dto.PredictionDto.PredictionWindow;
import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.entity.Prediction;
import com.cybertrace.backend.entity.RiskZone;
import com.cybertrace.backend.integration.MlServiceClient;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.PredictionRepository;
import com.cybertrace.backend.repository.RiskZoneRepository;
import com.cybertrace.backend.repository.TransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final PredictionRepository predictionRepository;
    private final AtmService atmService;
    private final ComplaintRepository complaintRepository;
    private final TransactionRepository transactionRepository;
    private final MlServiceClient mlServiceClient;
    private final AlertService alertService;
    private final ObjectMapper objectMapper;
    private final MlFeatureService mlFeatureService;
    private final RiskZoneRepository riskZoneRepository;

    public PredictionService(PredictionRepository predictionRepository,
                             AtmService atmService,
                             ComplaintRepository complaintRepository,
                             TransactionRepository transactionRepository,
                             MlServiceClient mlServiceClient,
                             AlertService alertService,
                             ObjectMapper objectMapper,
                             MlFeatureService mlFeatureService,
                             RiskZoneRepository riskZoneRepository) {
        this.predictionRepository = predictionRepository;
        this.atmService = atmService;
        this.complaintRepository = complaintRepository;
        this.transactionRepository = transactionRepository;
        this.mlServiceClient = mlServiceClient;
        this.alertService = alertService;
        this.objectMapper = objectMapper;
        this.mlFeatureService = mlFeatureService;
        this.riskZoneRepository = riskZoneRepository;
    }


    @Transactional(readOnly = true)
    public Page<PredictionResponse> getPredictions(String riskLevel, Pageable pageable) {
        return predictionRepository.findFilteredPredictions(riskLevel, pageable)
                .map(this::toPredictionResponse);
    }

    @Transactional
    public PredictionResponse runPredictionCycle(PredictionRunRequest request) {
        Atm atm = atmService.getAtmEntityByCode(request.atmId());

        OffsetDateTime now = OffsetDateTime.now();
        int windowMinutes = request.predictionWindowMinutes() != null ? request.predictionWindowMinutes() : 180;
        OffsetDateTime windowEnd = now.plusMinutes(windowMinutes);
        log.info("Running prediction cycle for ATM: {}, window: {}m", atm.getAtmCode(), windowMinutes);

        MlFeatureVector features = mlFeatureService.buildFeatures(atm, now);

        FastApiPredictRequest mlRequest = new FastApiPredictRequest(
                atm.getAtmCode(),
                features.hour(),
                features.dayOfWeek(),
                features.isWeekend(),

                features.complaintsLast1h(),
                features.complaintsLast6h(),
                features.complaintsLast24h(),

                features.withdrawalsLast1h(),
                features.withdrawalsLast6h(),
                features.withdrawalsLast24h(),

                features.withdrawalCount(),
                features.totalWithdrawalAmount(),
                features.averageWithdrawal(),
                features.uniqueAccounts(),
                features.transactionVelocity(),

                features.complaints1km(),
                features.complaints3km(),

                features.fraudEvents1km(),
                features.fraudEvents3km(),

                features.distanceFromRecentFraud(),
                features.historicalFraudCount(),
                features.historicalHotspotScore()
        );

        FastApiPredictResponse mlResponse = mlServiceClient.getPrediction(mlRequest);

        List<String> reasons = new ArrayList<>();
        if (features.complaintsLast24h() > 0) {
            reasons.add(
                "Nearby complaint activity: "
                + features.complaintsLast24h()
                + " complaints in the last 24h"
            );
        }

        if (features.withdrawalsLast1h() > 0) {
            reasons.add(
                "Recent withdrawal activity: "
                + features.withdrawalsLast1h()
                + " withdrawals in the last hour"
            );
        }

        if (features.fraudEvents3km() > 0) {
            reasons.add(
                "Recent fraud activity: "
                + features.fraudEvents3km()
                + " fraud events within 3km"
            );
        }

        if (features.distanceFromRecentFraud() < 1.0) {
            reasons.add(
                "Recent fraud activity detected within 1km"
            );
        }

        if (features.historicalHotspotScore() > 0) {
            reasons.add(
                "ATM is inside a risk zone with hotspot score "
                + Math.round(features.historicalHotspotScore())
            );
        }

        if (reasons.isEmpty()) {
            reasons.add("No elevated historical activity indicators detected");
        }


        String reasonsJson;
        try {
            reasonsJson = objectMapper.writeValueAsString(reasons);
        } catch (JsonProcessingException e) {
            reasonsJson = "[]";
        }

        Prediction prediction = new Prediction();
        prediction.setAtm(atm);
        prediction.setPredictionTime(now);
        prediction.setWindowStart(now);
        prediction.setWindowEnd(windowEnd);
        prediction.setRiskScore(mlResponse.riskScore());
        prediction.setRiskLevel(mlResponse.riskLevel());
        prediction.setModelVersion(mlResponse.modelVersion());
        prediction.setConfidence(mlResponse.probability());
        prediction.setReasons(reasonsJson);

        Prediction saved = predictionRepository.save(prediction);

        if (saved.getRiskScore() >= 60) {
            createOrUpdateRiskZone(atm, saved);
            String alertMsg = String.format("Elevated withdrawal risk (%d%%) detected at %s (%s). Recommended proactive monitoring.",
                    saved.getRiskScore(), atm.getArea() != null ? atm.getArea() : atm.getAtmCode(), atm.getAtmCode());
            alertService.createAndBroadcastAlert(saved, "ELEVATED_WITHDRAWAL_RISK", alertMsg);
        }

        return new PredictionResponse(
                atm.getAtmCode(),
                mlResponse.probability(),
                mlResponse.riskScore(),
                mlResponse.riskLevel(),
                mlResponse.modelVersion(),
                new PredictionWindow(now, windowEnd),
                reasons
        );
    }

    private void createOrUpdateRiskZone(Atm atm, Prediction prediction) {
        if (atm.getLocation() == null) {
            return;
        }

        String zoneName = (atm.getArea() != null ? atm.getArea() : atm.getAtmCode()) + " Predictive Risk Corridor";

        // Generate polygon buffer around ATM location (approx 800m - 1km buffer in degrees)
        Geometry bufferGeom = atm.getLocation().buffer(0.008, 8);
        if (!(bufferGeom instanceof Polygon polygon)) {
            return;
        }
        polygon.setSRID(4326);

        // Prevent duplicate active zones for the same ATM / prediction window
        RiskZone riskZone = riskZoneRepository.findActiveZonesByName(zoneName, prediction.getPredictionTime())
                .stream()
                .findFirst()
                .orElseGet(RiskZone::new);

        if (riskZone.getId() == null) {
            riskZone.setName(zoneName);
        }

        riskZone.setGeometry(polygon);
        riskZone.setRiskScore(prediction.getRiskScore());
        riskZone.setRiskLevel(prediction.getRiskLevel());
        riskZone.setPredictionWindowStart(prediction.getWindowStart());
        riskZone.setPredictionWindowEnd(prediction.getWindowEnd());

        riskZoneRepository.save(riskZone);
        log.info("Persisted RiskZone [{}] with riskScore={}, riskLevel={}, window=[{} - {}]",
                riskZone.getName(), riskZone.getRiskScore(), riskZone.getRiskLevel(),
                riskZone.getPredictionWindowStart(), riskZone.getPredictionWindowEnd());
    }


    private PredictionResponse toPredictionResponse(Prediction p) {
        List<String> reasonsList = new ArrayList<>();
        if (p.getReasons() != null) {
            try {
                reasonsList = objectMapper.readValue(p.getReasons(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        return new PredictionResponse(
                p.getAtm().getAtmCode(),
                p.getConfidence() != null ? p.getConfidence() : (p.getRiskScore() / 100.0),
                p.getRiskScore(),
                p.getRiskLevel(),
                p.getModelVersion(),
                new PredictionWindow(p.getWindowStart(), p.getWindowEnd()),
                reasonsList
        );
    }
}
