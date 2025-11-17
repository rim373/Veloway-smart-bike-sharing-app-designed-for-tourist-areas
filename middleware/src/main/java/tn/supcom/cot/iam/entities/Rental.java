package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDateTime;

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

    public void setBikeId(String bikeId) {this.bikeId = bikeId;}

    public void setDistanceTraveled(Float distanceTraveled) {
        this.distanceTraveled = distanceTraveled;}

    public void setFinalPhoto(String FinalPhoto) { this.finalPhoto = FinalPhoto; }

    public void setInitialPhoto(String InitialPhoto) { this.finalPhoto = InitialPhoto; }

    public void setPaymentId(String PaymentId) { this.paymentId = PaymentId; }

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