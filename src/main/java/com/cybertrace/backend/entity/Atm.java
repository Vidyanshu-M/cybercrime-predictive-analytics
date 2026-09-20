package com.cybertrace.backend.entity;

import java.util.UUID;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "atms")
public class Atm {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "atm_code", nullable = false, unique = true, length = 50)
    private String atmCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bank_id")
    private Bank bank;

    @Column(columnDefinition = "geography(Point, 4326)", nullable = false)
    private Point location;

    @Column(length = 100)
    private String district;

    @Column(length = 150)
    private String area;

    @Column(name = "atm_type", length = 50)
    private String atmType;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public Atm() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAtmCode() { return atmCode; }
    public void setAtmCode(String atmCode) { this.atmCode = atmCode; }

    public Bank getBank() { return bank; }
    public void setBank(Bank bank) { this.bank = bank; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getAtmType() { return atmType; }
    public void setAtmType(String atmType) { this.atmType = atmType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}