package com.cybertrace.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.cybertrace.backend.dto.AuthDto.LoginRequest;
import com.cybertrace.backend.dto.CaseDto.CreateCaseRequest;
import com.cybertrace.backend.dto.CaseDto.RegisterEvidenceRequest;
import com.cybertrace.backend.dto.CaseDto.UpdateCaseStatusRequest;
import com.cybertrace.backend.dto.ComplaintDto.CreateComplaintRequest;
import com.cybertrace.backend.dto.PredictionDto.PredictionRunRequest;
import com.cybertrace.backend.entity.Alert;
import com.cybertrace.backend.entity.User;
import com.cybertrace.backend.repository.AlertRepository;
import com.cybertrace.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class RestApiContractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    private String jwtToken;

    @BeforeEach
    void setup() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin@cybertrace.gov.in", "password123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        this.jwtToken = responseNode.get("token").asText();
    }

    @Test
    @DisplayName("POST /api/auth/login - Successfully issues JWT with roles")
    void testAuthLogin() throws Exception {
        LoginRequest loginReq = new LoginRequest("officer@cybertrace.gov.in", "password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_I4C_OFFICER"))
                .andExpect(jsonPath("$.email").value("officer@cybertrace.gov.in"));
    }

    @Test
    @DisplayName("GET /api/dashboard/summary - Returns KPI summary and active counts")
    void testDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalComplaints").isNumber())
                .andExpect(jsonPath("$.activeAlerts").isNumber())
                .andExpect(jsonPath("$.criticalHotspots").isNumber())
                .andExpect(jsonPath("$.recentAlerts").isArray());
    }

    @Test
    @DisplayName("GET /api/atms - Lists ATMs and supports PostGIS radius search")
    void testAtms() throws Exception {
        mockMvc.perform(get("/api/atms")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].atmCode").exists())
                .andExpect(jsonPath("$[0].longitude").isNumber())
                .andExpect(jsonPath("$[0].latitude").isNumber());

        mockMvc.perform(get("/api/atms?lon=77.2167&lat=28.6289&radiusMeters=2000")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/complaints & POST /api/complaints - Ingests and queries complaints")
    void testComplaintsCrud() throws Exception {
        String testNumber = "NCRP-TEST-" + System.currentTimeMillis();
        CreateComplaintRequest createReq = new CreateComplaintRequest(
                testNumber,
                "ATM Skimming & Clone",
                BigDecimal.valueOf(25000.00),
                "Delhi",
                "New Delhi",
                "Connaught Place PS",
                77.2167,
                28.6289
        );

        mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.complaintNumber").value(testNumber))
                .andExpect(jsonPath("$.status").value("NEW"));

        mockMvc.perform(get("/api/complaints?district=New Delhi")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/transactions - Queries transaction log")
    void testTransactions() throws Exception {
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/predictions/run - Executes prediction cycle, computes risk, and outputs reasons")
    void testRunPrediction() throws Exception {
        PredictionRunRequest req = new PredictionRunRequest("ATM1023", 180);

        mockMvc.perform(post("/api/predictions/run")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.atmId").value("ATM1023"))
                .andExpect(jsonPath("$.riskScore").isNumber())
                .andExpect(jsonPath("$.riskLevel").isNotEmpty())
                .andExpect(jsonPath("$.modelVersion").isNotEmpty())
                .andExpect(jsonPath("$.predictionWindow.start").exists())
                .andExpect(jsonPath("$.reasons").isArray());
    }

    @Test
    @DisplayName("Alert Workflow: GET, Acknowledge, and Assign Alert")
    void testAlertWorkflow() throws Exception {
        Alert alert = alertRepository.findAll().stream().findFirst().orElseThrow();
        User officer = userRepository.findByEmail("officer@cybertrace.gov.in").orElseThrow();

        mockMvc.perform(get("/api/alerts/" + alert.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(alert.getId().toString()))
                .andExpect(jsonPath("$.riskScore").value(alert.getRiskScore()));

        mockMvc.perform(patch("/api/alerts/" + alert.getId() + "/acknowledge")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACKNOWLEDGED"));

        String assignPayload = "{\"officerId\":\"" + officer.getId() + "\"}";
        mockMvc.perform(patch("/api/alerts/" + alert.getId() + "/assign")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedOfficerName").value(officer.getName()));
    }

    @Test
    @DisplayName("Case Management: GET, POST Case, Detail, and Evidence Registration")
    void testCaseManagement() throws Exception {
        User officer = userRepository.findByEmail("officer@cybertrace.gov.in").orElseThrow();
        String caseNumber = "CASE-TEST-" + System.currentTimeMillis();

        CreateCaseRequest caseReq = new CreateCaseRequest(
                caseNumber,
                "High Severity Test Investigation",
                "HIGH",
                officer.getId(),
                List.of(),
                List.of()
        );

        MvcResult caseResult = mockMvc.perform(post("/api/cases")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(caseReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.caseNumber").value(caseNumber))
                .andReturn();

        JsonNode caseJson = objectMapper.readTree(caseResult.getResponse().getContentAsString());
        UUID caseId = UUID.fromString(caseJson.get("id").asText());

        mockMvc.perform(get("/api/cases/" + caseId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseNumber").value(caseNumber));

        RegisterEvidenceRequest evidenceReq = new RegisterEvidenceRequest(
                "cctv_footage_atm1023.mp4",
                "video/mp4",
                "s3://cybertrace-vault/evidence/cctv_1023.mp4",
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );

        mockMvc.perform(post("/api/cases/" + caseId + "/evidence")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evidenceReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("cctv_footage_atm1023.mp4"));

        UpdateCaseStatusRequest statusReq = new UpdateCaseStatusRequest("IN_PROGRESS");
        mockMvc.perform(patch("/api/cases/" + caseId + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("GET /api/analytics/overview - Provides aggregated metrics for charts")
    void testAnalyticsOverview() throws Exception {
        mockMvc.perform(get("/api/analytics/overview")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complaintsByCategory").isArray())
                .andExpect(jsonPath("$.riskDistribution").isArray())
                .andExpect(jsonPath("$.topDistricts").isArray())
                .andExpect(jsonPath("$.modelPerformanceMetrics.f1Score").isNumber());
    }

    @Test
    @DisplayName("GET /api/map/risk-zones - Supplies GeoJSON polygon data to Member 2 GIS lead")
    void testMapRiskZones() throws Exception {
        mockMvc.perform(get("/api/map/risk-zones")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].geometry.type").value("Polygon"))
                .andExpect(jsonPath("$[0].geometry.coordinates").isArray());
    }

    @Test
    @DisplayName("GET /api/audit-logs - Queries silent audit trail for officers and admins")
    void testAuditLogs() throws Exception {
        mockMvc.perform(get("/api/audit-logs")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /v3/api-docs & /swagger-ui/index.html - Validates OpenAPI 3 specification")
    void testSwaggerAndOpenApiDocs() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists())
                .andExpect(jsonPath("$.info.title").value("CyberTrace - Cybercrime Predictive Analytics API"))
                .andExpect(jsonPath("$.paths").isMap());

        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }
}
