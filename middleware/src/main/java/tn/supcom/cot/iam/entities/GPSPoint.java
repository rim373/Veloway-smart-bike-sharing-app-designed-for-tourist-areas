package tn.supcom.cot.iam.entities;

import jakarta.nosql.Id;
import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import java.time.LocalDateTime;


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
