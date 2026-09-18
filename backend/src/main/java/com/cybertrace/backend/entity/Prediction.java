package com.cybertrace.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "atm_id", nullable = false)
    private Atm atm;

    @Column(name = "prediction_time", nullable = false)
    private OffsetDateTime predictionTime;

    @Column(name = "window_start", nullable = false)
    private OffsetDateTime windowStart;

    @Column(name = "window_end", nullable = false)
    private OffsetDateTime windowEnd;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false, length = 50)
    private String riskLevel;

    @Column(name = "model_version", nullable = false, length = 50)
    private String modelVersion;

    private Double confidence;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "reasons", columnDefinition = "jsonb")
    private String reasons;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.predictionTime == null) {
            this.predictionTime = OffsetDateTime.now();
        }
        this.createdAt = OffsetDateTime.now();
    }

    public Prediction() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Atm getAtm() { return atm; }
    public void setAtm(Atm atm) { this.atm = atm; }

    public OffsetDateTime getPredictionTime() { return predictionTime; }
    public void setPredictionTime(OffsetDateTime predictionTime) { this.predictionTime = predictionTime; }

    public OffsetDateTime getWindowStart() { return windowStart; }
    public void setWindowStart(OffsetDateTime windowStart) { this.windowStart = windowStart; }

    public OffsetDateTime getWindowEnd() { return windowEnd; }
    public void setWindowEnd(OffsetDateTime windowEnd) { this.windowEnd = windowEnd; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getReasons() { return reasons; }
    public void setReasons(String reasons) { this.reasons = reasons; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
