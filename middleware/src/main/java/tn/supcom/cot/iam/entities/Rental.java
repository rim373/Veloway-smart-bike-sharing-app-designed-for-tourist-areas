package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
public class Rental{

    @Id
    private String RentalId;

    @Column
    private LocalDateTime StartDateTime;

    @Column
    private LocalDateTime EndDateTime;

    @Column
    private Integer Duration;

    @Column
    private Float distanceTraveled;

    @Column
    private String bikeId; //Lien avec bike

    @Column
    private String initialPhoto;

    @Column
    private String finalPhoto;

    @Column
    private String paymentId; //Lien avec payment

    @Column
    private String userId; //lien avec user

    @Column
    private String startStationId; // start station

    @Column
    private String endStationId; // end station

    public String getRentalId() {
        return RentalId;
    }

    public LocalDateTime getStartDateTime() {
        return StartDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return EndDateTime;
    }

    public Integer getDuration() {
        return Duration;
    }

    public String getBikeId() {return bikeId;}

    public Float getDistanceTraveled() {return distanceTraveled;
    }

    public String getInitialPhoto() {return initialPhoto;}

    public String getFinalPhoto() {return finalPhoto;}

    public String getPaymentId() {return paymentId;}

    public String getUserId() {return userId;}

    public String getStartStationId() {return startStationId;}

    public String getEndStationId() {return endStationId;}

    public void setBikeId(String bikeId) {this.bikeId = bikeId;}

    public void setDistanceTraveled(Float distanceTraveled) {
        this.distanceTraveled = distanceTraveled;}

    public void setFinalPhoto(String FinalPhoto) { this.finalPhoto = FinalPhoto; }

    public void setInitialPhoto(String InitialPhoto) { this.initialPhoto = InitialPhoto; }

    public void setPaymentId(String PaymentId) { this.paymentId = PaymentId; }

    public void setStartDateTime(LocalDateTime StartDateTime) { this.StartDateTime = StartDateTime; }

    public void setEndDateTime(LocalDateTime EndDateTime) { this.EndDateTime = EndDateTime; }

    public void setUserId(String UserId) { this.userId = UserId; }

    public void setStartStationId(String StartStationId) { this.startStationId = StartStationId; }

    public void setEndStationId(String EndStationId) { this.endStationId = EndStationId; }

    public boolean StartRental(){
        if (this.StartDateTime == null) {
            this.StartDateTime = LocalDateTime.now();
            return true;
        }
        return false;
    }

    public boolean EndRental(){
        if (this.StartDateTime != null && this.EndDateTime == null ) {
            this.EndDateTime = LocalDateTime.now();
            this.Duration = (int) Duration.between(this.StartDateTime, this.EndDateTime).toMinutes();
            return true;
        }
        return false;
    }

    public Float calculateAmount(){}
}