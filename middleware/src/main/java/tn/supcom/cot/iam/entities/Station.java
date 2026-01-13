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
public class Station{

    @Id
    private String stationId;

    @Column
    private String name;

    @Column
    private String address;

    @Column
    private Float latitude;

    @Column
    private Float longitude;

    @Column
    private Integer totalCapacity;

    @Column
    private Integer availableBikes;

    //Id Generation
    public void generateId() {
        if (this.stationId == null || this.stationId.isEmpty()) {
            this.stationId = "STATION-" + UUID.randomUUID().toString();
        }
    }



}