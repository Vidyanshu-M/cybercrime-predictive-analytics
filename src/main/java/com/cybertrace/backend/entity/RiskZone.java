package com.cybertrace.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Polygon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_zones")
public class RiskZone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "geography(Polygon, 4326)", nullable = false)
    private Polygon geometry;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false, length = 50)
    private String riskLevel;

    @Column(name = "prediction_window_start", nullable = false)
    private OffsetDateTime predictionWindowStart;

    @Column(name = "prediction_window_end", nullable = false)
    private OffsetDateTime predictionWindowEnd;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public RiskZone() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Polygon getGeometry() { return geometry; }
    public void setGeometry(Polygon geometry) { this.geometry = geometry; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public OffsetDateTime getPredictionWindowStart() { return predictionWindowStart; }
    public void setPredictionWindowStart(OffsetDateTime predictionWindowStart) { this.predictionWindowStart = predictionWindowStart; }

    public OffsetDateTime getPredictionWindowEnd() { return predictionWindowEnd; }
    public void setPredictionWindowEnd(OffsetDateTime predictionWindowEnd) { this.predictionWindowEnd = predictionWindowEnd; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
