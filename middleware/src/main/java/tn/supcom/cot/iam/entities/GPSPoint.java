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
public class GPSPoint {
    @Id
    private String gpsPointId;

    @Column
    private Float latitude;

    @Column
    private Float longitude;

    @Column
    private LocalDateTime timestamp;
}
