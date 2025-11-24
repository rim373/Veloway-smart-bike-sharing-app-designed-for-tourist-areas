package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.Duration;
import java.time.LocalDateTime;

import java.util.UUID;

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

    public String getRentalId() {
        return rentalId;
    }

    public void setRentalId(String rentalId) {
        this.rentalId = rentalId;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Float getDistanceTraveled() {
        return distanceTraveled;
    }

    public void setDistanceTraveled(Float distanceTraveled) {
        this.distanceTraveled = distanceTraveled;
    }

    public String getBikeId() {
        return bikeId;
    }

    public void setBikeId(String bikeId) {
        this.bikeId = bikeId;
    }

    public String getInitialPhoto() {
        return initialPhoto;
    }

    public void setInitialPhoto(String initialPhoto) {
        this.initialPhoto = initialPhoto;
    }

    public String getFinalPhoto() {
        return finalPhoto;
    }

    public void setFinalPhoto(String finalPhoto) {
        this.finalPhoto = finalPhoto;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStartStationId() {
        return startStationId;
    }

    public void setStartStationId(String startStationId) {
        this.startStationId = startStationId;
    }

    public String getEndStationId() {
        return endStationId;
    }

    public void setEndStationId(String endStationId) {
        this.endStationId = endStationId;
    }

    public String getRentalStatus() {
        return rentalStatus;
    }

    public void setRentalStatus(String status) {
        this.rentalStatus = status;
    }

    public Float getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Float totalAmount) {
        this.totalPrice = totalAmount;
    }


}