package tn.supcom.cot.iam.entities;

import jakarta.nosql.Id;
import jakarta.nosql.Entity;
import jakarta.nosql.Column;

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
public class IOTSensor {
    @Id
    private String sensorId;

    @Column
    private String sensorName;

    @Column
    private String sensorDescription;

    @Column
    private String sensorType;

    @Column
    private String stationId;
}
