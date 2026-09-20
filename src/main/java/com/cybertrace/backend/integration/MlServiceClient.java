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
        log.info("Calling Python ML FastAPI service at /predict for ATM: {}", request.atmId());
        return restClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(FastApiPredictResponse.class);
    }
}
