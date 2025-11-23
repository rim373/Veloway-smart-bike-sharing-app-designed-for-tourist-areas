package tn.supcom.cot.iam.entities;

import jakarta.nosql.Column;
import jakarta.nosql.Id;
import jakarta.nosql.Entity;

import java.time.LocalDateTime;
import java.util.UUID;

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

    public String getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(String maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Float getCost() {
        return cost;
    }

    public void setCost(Float cost) {
        this.cost = cost;
    }

    public String getBikeId() {
        return bikeId;
    }

    public void setBikeId(String bikeId) {
        this.bikeId = bikeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
