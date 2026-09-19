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
import com.cybertrace.backend.integration.MlServiceClient;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.PredictionRepository;
import com.cybertrace.backend.repository.TransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    public PredictionService(PredictionRepository predictionRepository,
                             AtmService atmService,
                             ComplaintRepository complaintRepository,
                             TransactionRepository transactionRepository,
                             MlServiceClient mlServiceClient,
                             AlertService alertService,
                             ObjectMapper objectMapper) {
        this.predictionRepository = predictionRepository;
        this.atmService = atmService;
        this.complaintRepository = complaintRepository;
        this.transactionRepository = transactionRepository;
        this.mlServiceClient = mlServiceClient;
        this.alertService = alertService;
        this.objectMapper = objectMapper;
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

        double lon = atm.getLocation().getX();
        double lat = atm.getLocation().getY();

        long complaints24h = complaintRepository.countComplaintsNearPoint(lon, lat, 3000.0, now.minusHours(24));
        long withdrawals6h = transactionRepository.countRecentWithdrawalsAtAtm(atm.getId(), now.minusHours(6));
        long nearbyFraud = transactionRepository.countNearbyFraudTransactions(lon, lat, 3000.0, now.minusHours(24));
        double distance = 0.8;

        FastApiPredictRequest mlRequest = new FastApiPredictRequest(
                atm.getAtmCode(),
                now.getHour(),
                (int) complaints24h,
                (int) withdrawals6h,
                (int) nearbyFraud,
                distance
        );

        FastApiPredictResponse mlResponse = mlServiceClient.getPrediction(mlRequest);

        List<String> reasons = new ArrayList<>();
        if (complaints24h > 0) {
            reasons.add("High complaint density nearby (" + complaints24h + " complaints in 24h)");
        }
        if (withdrawals6h > 3) {
            reasons.add("Recent withdrawal activity increased (" + withdrawals6h + " withdrawals in 6h)");
        }
        if (nearbyFraud > 0) {
            reasons.add("Historical hotspot pattern: " + nearbyFraud + " recent fraud events in 3km radius");
        }
        if (reasons.isEmpty()) {
            reasons.add("Baseline risk parameters within normal thresholds");
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
