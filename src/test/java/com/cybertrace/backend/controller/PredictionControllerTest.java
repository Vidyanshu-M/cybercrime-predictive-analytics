package com.cybertrace.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.cybertrace.backend.dto.PredictionDto.PredictionResponse;
import com.cybertrace.backend.dto.PredictionDto.PredictionRunRequest;
import com.cybertrace.backend.dto.PredictionDto.PredictionWindow;
import com.cybertrace.backend.security.CustomUserDetailsService;
import com.cybertrace.backend.security.JwtAuthenticationFilter;
import com.cybertrace.backend.security.JwtTokenProvider;
import com.cybertrace.backend.service.PredictionService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(
    controllers = PredictionController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {JwtAuthenticationFilter.class}
    )
)
@AutoConfigureMockMvc(addFilters = false)
class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PredictionService predictionService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/predictions/run returns 200 with modelVersion xgb-v1 and 21-feature explanation reasons")
    void testRunPredictionEndpoint() throws Exception {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime windowEnd = now.plusMinutes(180);

        PredictionResponse mockResponse = new PredictionResponse(
                "ATM1023",
                0.92,
                92,
                "CRITICAL",
                "xgb-v1",
                new PredictionWindow(now, windowEnd),
                List.of(
                        "Nearby complaint activity: 17 complaints in the last 24h",
                        "Recent withdrawal activity: 5 withdrawals in the last hour",
                        "Recent fraud activity: 5 fraud events within 3km",
                        "Recent fraud activity detected within 1km",
                        "ATM is inside a risk zone with hotspot score 72"
                )
        );

        when(predictionService.runPredictionCycle(any(PredictionRunRequest.class))).thenReturn(mockResponse);

        PredictionRunRequest req = new PredictionRunRequest("ATM1023", 180);

        mockMvc.perform(post("/api/predictions/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.atmId").value("ATM1023"))
                .andExpect(jsonPath("$.probability").value(0.92))
                .andExpect(jsonPath("$.riskScore").value(92))
                .andExpect(jsonPath("$.riskLevel").value("CRITICAL"))
                .andExpect(jsonPath("$.modelVersion").value("xgb-v1"))
                .andExpect(jsonPath("$.predictionWindow.start").exists())
                .andExpect(jsonPath("$.predictionWindow.end").exists())
                .andExpect(jsonPath("$.reasons[0]").value("Nearby complaint activity: 17 complaints in the last 24h"))
                .andExpect(jsonPath("$.reasons[1]").value("Recent withdrawal activity: 5 withdrawals in the last hour"))
                .andExpect(jsonPath("$.reasons[2]").value("Recent fraud activity: 5 fraud events within 3km"))
                .andExpect(jsonPath("$.reasons[3]").value("Recent fraud activity detected within 1km"))
                .andExpect(jsonPath("$.reasons[4]").value("ATM is inside a risk zone with hotspot score 72"));
    }
}
