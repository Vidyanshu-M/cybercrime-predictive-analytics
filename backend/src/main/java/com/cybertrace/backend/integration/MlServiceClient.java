package com.cybertrace.backend.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.cybertrace.backend.dto.PredictionDto.FastApiPredictRequest;
import com.cybertrace.backend.dto.PredictionDto.FastApiPredictResponse;

@Service
public class MlServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MlServiceClient.class);
    private final RestClient restClient;

    public MlServiceClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public FastApiPredictResponse getPrediction(FastApiPredictRequest request) {
        try {
            log.info("Calling Python ML FastAPI service at /predict for ATM: {}", request.atmId());
            return restClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(FastApiPredictResponse.class);
        } catch (Exception ex) {
            log.warn("FastAPI ML service unreachable or returned error ({}). Falling back to built-in hybrid risk engine.", ex.getMessage());
            return fallbackPredict(request);
        }
    }

    private FastApiPredictResponse fallbackPredict(FastApiPredictRequest req) {
        double score = 15.0;
        score += Math.min(35.0, req.complaints24h() * 2.5);
        score += Math.min(25.0, req.withdrawals6h() * 3.0);
        score += Math.min(25.0, req.nearbyFraud() * 5.0);

        if (req.distance() <= 1.0) {
            score += 10.0;
        } else if (req.distance() <= 3.0) {
            score += 5.0;
        }

        int finalScore = (int) Math.min(100, Math.max(0, Math.round(score)));
        double probability = Math.round((finalScore / 100.0) * 100.0) / 100.0;

        String riskLevel;
        if (finalScore >= 80) {
            riskLevel = "CRITICAL";
        } else if (finalScore >= 60) {
            riskLevel = "HIGH";
        } else if (finalScore >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        return new FastApiPredictResponse(probability, finalScore, riskLevel, "rule-hybrid-v1");
    }
}
