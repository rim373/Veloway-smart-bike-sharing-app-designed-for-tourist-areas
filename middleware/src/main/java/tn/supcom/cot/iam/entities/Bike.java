package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
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
public class Bike{

    @Id
    private String bikeId;

    @Column
    private String serialNumber;

    @Column
    private String brand;

    @Column
    private String model;

    @Column
    private Integer batteryLevel;

    @Column
    private String status;

    @Column
    private String stationId;

    //ID
    public void generateId() {
        if (this.bikeId == null || this.bikeId.isEmpty()) {
            this.bikeId = "BIKE-" + UUID.randomUUID().toString();
        }
    }


}