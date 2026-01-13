package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

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
public class Rental{

    @Id
    private String rentalId;

    @Column
    private LocalDateTime startDateTime;

    @Column
    private LocalDateTime endDateTime;

    @Column
    private Integer duration;

    @Column
    private Float distanceTraveled;

    @Column
    private String bikeId; //Link with bike

    @Column
    private String initialPhoto;

    @Column
    private String finalPhoto;

    @Column
    private String paymentId; //Link with payment

    @Column
    private String userId; //link with user

    @Column
    private String startStationId; // start station

    @Column
    private String endStationId; // end station

    @Column
    private String rentalStatus;

    @Column
    private Float totalPrice;

    //ID Generation
    public void generateId() {
        if (this.rentalId == null || this.rentalId.isEmpty()) {
            this.rentalId = "RENTAL-" + UUID.randomUUID().toString();
        }
    }


}