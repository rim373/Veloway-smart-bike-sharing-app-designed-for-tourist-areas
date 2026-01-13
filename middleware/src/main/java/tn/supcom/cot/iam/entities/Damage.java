package tn.supcom.cot.iam.entities;

import jakarta.nosql.Id;
import jakarta.nosql.Column;
import jakarta.nosql.Entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

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

}
