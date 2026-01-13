package tn.supcom.cot.iam.entities;

import jakarta.nosql.Column;
import jakarta.nosql.Id;
import jakarta.nosql.Entity;

import java.time.LocalDateTime;
import java.util.UUID;

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
public class Maintenance {
    @Id
    private String maintenanceId;

    @Column
    private LocalDateTime date;

    @Column
    private Float cost;

    @Column
    private String bikeId;

    @Column
    private String description;

    public void generateId() {
        if (this.maintenanceId == null || this.maintenanceId.isEmpty()) {
            this.maintenanceId = "MNT-" + UUID.randomUUID().toString();
        }
    }


}
