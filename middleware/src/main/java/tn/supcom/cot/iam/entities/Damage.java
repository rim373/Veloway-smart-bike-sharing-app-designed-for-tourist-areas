package tn.supcom.cot.iam.entities;

import jakarta.nosql.Id;
import jakarta.nosql.Column;
import jakarta.nosql.Entity;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Damage {
    @Id
    private String damageId;

    @Column
    private String description;

    @Column
    private Float repairCost;

    @Column
    private String beforePhoto;

    @Column
    private String afterPhoto;

    @Column
    private Float confidenceScore;

    @Column
    private String bikeId;

    @Column
    private String rentalId;

    @Column
    private String damageStatus; // DETECTED, CONFIRMED, REPAIRED

    @Column
    private LocalDateTime detectionDate;

    @Column
    private LocalDateTime repairDate;

    public void generateId() {
        if (this.damageId == null || this.damageId.isEmpty()) {
            this.damageId = "DMG-" + UUID.randomUUID().toString();
        }
    }

    public String getDamageId() {
        return damageId;
    }

    public void setDamageId(String damageId) {
        this.damageId = damageId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getRepairCost() {
        return repairCost;
    }

    public void setRepairCost(Float repairCost) {
        this.repairCost = repairCost;
    }

    public String getBeforePhoto() {
        return beforePhoto;
    }

    public void setBeforePhoto(String beforePhoto) {
        this.beforePhoto = beforePhoto;
    }

    public String getAfterPhoto() {
        return afterPhoto;
    }

    public void setAfterPhoto(String afterPhoto) {
        this.afterPhoto = afterPhoto;
    }

    public Float getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Float confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getBikeId() {
        return bikeId;
    }

    public void setBikeId(String bikeId) {
        this.bikeId = bikeId;
    }

    public String getRentalId() {
        return rentalId;
    }

    public void setRentalId(String rentalId) {
        this.rentalId = rentalId;
    }

    public String getDamageStatus() {
        return damageStatus;
    }

    public void setDamageStatus(String status) {
        this.damageStatus = status;
    }

    public LocalDateTime getDetectionDate() {
        return detectionDate;
    }

    public void setDetectionDate(LocalDateTime detectionDate) {
        this.detectionDate = detectionDate;
    }

    public LocalDateTime getRepairDate() {
        return repairDate;
    }

    public void setRepairDate(LocalDateTime repairDate) {
        this.repairDate = repairDate;
    }
}
