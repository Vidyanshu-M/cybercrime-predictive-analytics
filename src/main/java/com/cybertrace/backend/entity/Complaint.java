package com.cybertrace.backend.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "complaint_number", nullable = false, unique = true, length = 100)
    private String complaintNumber;

    @Column(name = "reported_at", nullable = false)
    private OffsetDateTime reportedAt;

    @Column(name = "crime_category", nullable = false, length = 100)
    private String crimeCategory;

    @Column(name = "fraud_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal fraudAmount = BigDecimal.ZERO;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String district;

    @Column(name = "police_station", length = 150)
    private String policeStation;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(nullable = false, length = 50)
    private String status = "NEW";

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.reportedAt == null) {
            this.reportedAt = OffsetDateTime.now();
        }
        this.createdAt = OffsetDateTime.now();
    }

    public Complaint() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }

    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime reportedAt) { this.reportedAt = reportedAt; }

    public String getCrimeCategory() { return crimeCategory; }
    public void setCrimeCategory(String crimeCategory) { this.crimeCategory = crimeCategory; }

    public BigDecimal getFraudAmount() { return fraudAmount; }
    public void setFraudAmount(BigDecimal fraudAmount) { this.fraudAmount = fraudAmount; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPoliceStation() { return policeStation; }
    public void setPoliceStation(String policeStation) { this.policeStation = policeStation; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
