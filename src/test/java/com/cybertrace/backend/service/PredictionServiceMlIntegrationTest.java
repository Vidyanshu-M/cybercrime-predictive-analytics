package com.cybertrace.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.ArgumentCaptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.client.RestClient;

import com.cybertrace.backend.dto.AlertDto.AlertResponse;
import com.cybertrace.backend.dto.PredictionDto.FastApiPredictRequest;
import com.cybertrace.backend.dto.PredictionDto.FastApiPredictResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionRunRequest;
import com.cybertrace.backend.entity.Atm;
import com.cybertrace.backend.entity.Prediction;
import com.cybertrace.backend.entity.RiskZone;
import com.cybertrace.backend.event.AlertCreatedEvent;
import com.cybertrace.backend.event.AlertEventListener;
import com.cybertrace.backend.integration.MlServiceClient;
import com.cybertrace.backend.repository.ComplaintRepository;
import com.cybertrace.backend.repository.PredictionRepository;
import com.cybertrace.backend.repository.RiskZoneRepository;
import com.cybertrace.backend.repository.TransactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PredictionServiceMlIntegrationTest {

    private ObjectMapper objectMapper;
    private RestClient restClient;
    private MlServiceClient mlServiceClient;
    private PredictionRepository predictionRepository;
    private AtmService atmService;
    private ComplaintRepository complaintRepository;
    private TransactionRepository transactionRepository;
    private AlertService alertService;
    private MlFeatureService mlFeatureService;
    private RiskZoneRepository riskZoneRepository;
    private PredictionService predictionService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));

        restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .requestFactory(factory)
                .build();

        mlServiceClient = new MlServiceClient(restClient);

        predictionRepository = mock(PredictionRepository.class);
        atmService = mock(AtmService.class);
        complaintRepository = mock(ComplaintRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        alertService = mock(AlertService.class);
        mlFeatureService = mock(MlFeatureService.class);
        riskZoneRepository = mock(RiskZoneRepository.class);

        MlFeatureVector defaultFeatures = new MlFeatureVector(
                20,
                4,
                0,
                3,
                8,
                17,
                5,
                8,
                24,
                5,
                12500.0,
                2500.0,
                4,
                5.0,
                4,
                12,
                2,
                5,
                0.8,
                15,
                0.72
        );
        when(mlFeatureService.buildFeatures(any(), any())).thenReturn(defaultFeatures);

        when(predictionRepository.save(any(Prediction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        predictionService = new PredictionService(
                predictionRepository,
                atmService,
                complaintRepository,
                transactionRepository,
                mlServiceClient,
                alertService,
                objectMapper,
                mlFeatureService,
                riskZoneRepository
        );
    }

    @Test
    @DisplayName("Verify FastApiPredictRequest serializes exactly 22 properties with 21 snake_case features")
    void testFastApiPredictRequestSerializationContract() throws Exception {
        FastApiPredictRequest req = new FastApiPredictRequest(
                "ATM1023",
                20,
                4,
                0,
                3,
                8,
                17,
                5,
                8,
                24,
                5,
                12500.0,
                2500.0,
                4,
                5.0,
                4,
                12,
                2,
                5,
                0.8,
                15,
                0.72
        );

        String json = objectMapper.writeValueAsString(req);
        JsonNode tree = objectMapper.readTree(json);

        // Exactly 22 JSON properties (atmId + 21 model features)
        assertEquals(22, tree.size(), "Request JSON must have exactly 22 properties");

        Set<String> expectedFields = Set.of(
                "atmId",
                "hour",
                "day_of_week",
                "is_weekend",
                "complaints_last_1h",
                "complaints_last_6h",
                "complaints_last_24h",
                "withdrawals_last_1h",
                "withdrawals_last_6h",
                "withdrawals_last_24h",
                "withdrawal_count",
                "total_withdrawal_amount",
                "average_withdrawal",
                "unique_accounts",
                "transaction_velocity",
                "complaints_1km",
                "complaints_3km",
                "fraud_events_1km",
                "fraud_events_3km",
                "distance_from_recent_fraud",
                "historical_fraud_count",
                "historical_hotspot_score"
        );

        for (String field : expectedFields) {
            assertTrue(tree.has(field), "Missing JSON property: " + field);
        }
    }

    @Test
    @DisplayName("Live End-to-End: Spring Boot RestClient calls running FastAPI /predict and gets xgb-v1 prediction")
    void testLiveFastApiPrediction() {
        FastApiPredictRequest req = new FastApiPredictRequest(
                "ATM1023",
                20,
                4,
                0,
                3,
                8,
                17,
                5,
                8,
                24,
                5,
                12500.0,
                2500.0,
                4,
                5.0,
                4,
                12,
                2,
                5,
                0.8,
                15,
                0.72
        );

        FastApiPredictResponse response = mlServiceClient.getPrediction(req);

        assertNotNull(response);
        assertEquals("xgb-v1", response.modelVersion());
        assertEquals("ATM1023", response.atmId());
        assertEquals(180, response.predictionWindowMinutes());
        assertTrue(response.probability() >= 0.0 && response.probability() <= 1.0);
        assertTrue(response.riskScore() >= 0 && response.riskScore() <= 100);
        assertTrue(List.of("LOW", "MEDIUM", "HIGH", "CRITICAL").contains(response.riskLevel()));
    }

    @Test
    @DisplayName("Full Prediction Cycle: Features -> FastAPI xgb-v1 -> Persistence -> Alerting")
    void testFullPredictionCycle() {
        Atm atm = new Atm();
        atm.setAtmCode("ATM1023");
        atm.setArea("Connaught Place");
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(77.2197, 28.6328));
        atm.setLocation(point);

        when(atmService.getAtmEntityByCode("ATM1023")).thenReturn(atm);

        MlFeatureVector features = new MlFeatureVector(
                20,
                4,
                0,
                3,
                8,
                17,
                5,
                8,
                24,
                5,
                12500.0,
                2500.0,
                4,
                5.0,
                4,
                12,
                2,
                5,
                0.8,
                15,
                0.72
        );

        when(mlFeatureService.buildFeatures(eq(atm), any(OffsetDateTime.class))).thenReturn(features);

        PredictionRunRequest runRequest = new PredictionRunRequest("ATM1023", 180);
        PredictionResponse response = predictionService.runPredictionCycle(runRequest);

        assertNotNull(response);
        assertEquals("ATM1023", response.atmId());
        assertEquals("xgb-v1", response.modelVersion());
        assertNotNull(response.predictionWindow());
        assertNotNull(response.reasons());
        assertTrue(!response.reasons().isEmpty());

        // Verify that explanation reasons reflect real feature values
        boolean hasComplaintsReason = response.reasons().stream().anyMatch(r -> r.contains("Nearby complaint activity: 17"));
        boolean hasWithdrawalsReason = response.reasons().stream().anyMatch(r -> r.contains("Recent withdrawal activity: 5"));
        boolean hasFraudEventsReason = response.reasons().stream().anyMatch(r -> r.contains("Recent fraud activity: 5"));
        boolean hasDistanceReason = response.reasons().stream().anyMatch(r -> r.contains("Recent fraud activity detected within 1km"));

        assertTrue(hasComplaintsReason, "Should explain complaints activity");
        assertTrue(hasWithdrawalsReason, "Should explain withdrawal activity");
        assertTrue(hasFraudEventsReason, "Should explain fraud events within 3km");
        assertTrue(hasDistanceReason, "Should explain fraud distance within 1km");

        // Verify alert and risk zone triggered if score >= 60
        if (response.riskScore() >= 60) {
            verify(alertService).createAndBroadcastAlert(any(Prediction.class), eq("ELEVATED_WITHDRAWAL_RISK"), any(String.class));
            verify(riskZoneRepository).save(any(RiskZone.class));
        }
    }

    @Test
    @DisplayName("Phase 13.3: Elevated prediction creates a RiskZone with polygon buffer, score, level, and window")
    void testElevatedPredictionCreatesRiskZone() {
        MlServiceClient mockMlClient = mock(MlServiceClient.class);
        PredictionService customPredictionService = new PredictionService(
                predictionRepository,
                atmService,
                complaintRepository,
                transactionRepository,
                mockMlClient,
                alertService,
                objectMapper,
                mlFeatureService,
                riskZoneRepository
        );

        Atm atm = new Atm();
        atm.setAtmCode("ATM1023");
        atm.setArea("Connaught Place");
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(77.2197, 28.6328));
        atm.setLocation(point);

        when(atmService.getAtmEntityByCode("ATM1023")).thenReturn(atm);
        when(mockMlClient.getPrediction(any())).thenReturn(
                new FastApiPredictResponse(0.88, 88, "CRITICAL", "xgb-v1", 180, "ATM1023")
        );
        when(riskZoneRepository.findActiveZonesByName(any(), any())).thenReturn(List.of());

        PredictionRunRequest runRequest = new PredictionRunRequest("ATM1023", 180);
        customPredictionService.runPredictionCycle(runRequest);

        ArgumentCaptor<RiskZone> zoneCaptor = ArgumentCaptor.forClass(RiskZone.class);
        verify(riskZoneRepository, times(1)).save(zoneCaptor.capture());

        RiskZone createdZone = zoneCaptor.getValue();
        assertNotNull(createdZone);
        assertEquals("Connaught Place Predictive Risk Corridor", createdZone.getName());
        assertEquals(88, createdZone.getRiskScore());
        assertEquals("CRITICAL", createdZone.getRiskLevel());
        assertNotNull(createdZone.getGeometry());
        assertTrue(createdZone.getGeometry() instanceof Polygon);
        assertEquals(4326, createdZone.getGeometry().getSRID());
        assertNotNull(createdZone.getPredictionWindowStart());
        assertNotNull(createdZone.getPredictionWindowEnd());
        assertTrue(createdZone.getPredictionWindowEnd().isAfter(createdZone.getPredictionWindowStart()));

        // Also verify alert creation was triggered
        verify(alertService, times(1)).createAndBroadcastAlert(any(Prediction.class), eq("ELEVATED_WITHDRAWAL_RISK"), any(String.class));
    }

    @Test
    @DisplayName("Phase 13.3: Duplicate prevention updates existing active RiskZone instead of creating duplicate")
    void testElevatedPredictionUpdatesExistingRiskZone() {
        MlServiceClient mockMlClient = mock(MlServiceClient.class);
        PredictionService customPredictionService = new PredictionService(
                predictionRepository,
                atmService,
                complaintRepository,
                transactionRepository,
                mockMlClient,
                alertService,
                objectMapper,
                mlFeatureService,
                riskZoneRepository
        );

        Atm atm = new Atm();
        atm.setAtmCode("ATM1023");
        atm.setArea("Connaught Place");
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        atm.setLocation(gf.createPoint(new Coordinate(77.2197, 28.6328)));

        UUID existingZoneId = UUID.randomUUID();
        RiskZone existingZone = new RiskZone();
        existingZone.setId(existingZoneId);
        existingZone.setName("Connaught Place Predictive Risk Corridor");
        existingZone.setRiskScore(65);
        existingZone.setRiskLevel("HIGH");

        when(atmService.getAtmEntityByCode("ATM1023")).thenReturn(atm);
        when(mockMlClient.getPrediction(any())).thenReturn(
                new FastApiPredictResponse(0.92, 92, "CRITICAL", "xgb-v1", 180, "ATM1023")
        );
        when(riskZoneRepository.findActiveZonesByName(eq("Connaught Place Predictive Risk Corridor"), any()))
                .thenReturn(List.of(existingZone));

        PredictionRunRequest runRequest = new PredictionRunRequest("ATM1023", 180);
        customPredictionService.runPredictionCycle(runRequest);

        ArgumentCaptor<RiskZone> zoneCaptor = ArgumentCaptor.forClass(RiskZone.class);
        verify(riskZoneRepository, times(1)).save(zoneCaptor.capture());

        RiskZone savedZone = zoneCaptor.getValue();
        assertEquals(existingZoneId, savedZone.getId(), "Must update the same existing active zone ID");
        assertEquals(92, savedZone.getRiskScore());
        assertEquals("CRITICAL", savedZone.getRiskLevel());
    }

    @Test
    @DisplayName("Phase 13.3: AlertCreatedEvent -> AlertEventListener -> SimpMessagingTemplate -> /topic/alerts")
    void testAlertEventListenerDispatchesToWebSocket() {
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        AlertEventListener listener = new AlertEventListener(messagingTemplate);

        UUID alertId = UUID.randomUUID();
        AlertResponse alertResponse = new AlertResponse(
                alertId,
                UUID.randomUUID(),
                "ATM1023",
                "ELEVATED_WITHDRAWAL_RISK",
                88,
                "CRITICAL",
                "Elevated withdrawal risk (88%) detected at Connaught Place",
                "NEW",
                OffsetDateTime.now(),
                null,
                null,
                77.2197,
                28.6328
        );


        AlertCreatedEvent event = new AlertCreatedEvent(alertResponse);
        listener.handleAlertCreated(event);

        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/alerts"), eq(alertResponse));
    }
}
