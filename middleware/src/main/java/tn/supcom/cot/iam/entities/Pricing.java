package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

@Entity
public class Pricing{

    @Id
    private String pricingId;

    @Column
    private Float pricePerMinute;

    @Column
    private Float pricePerKm;

    public enum PricingMode {
        TIME,
        DISTANCE
    }

    public String getPricingId {
        return pricingId;
    }

    public Float getPricePerMinute() {
        return pricePerMinute;
    }

    public Float getPricePerKm() {
        return pricePerKm;
    }

    public void setPricePerMinute(Float PricePerMinute) {
        this.pricePerMinute = PricePerMinute;
    }

    public void setPricePerKm( Float PricePerKm) {
        this.pricePerKm = PricePerKm;
    }

    public Float calculateAmount( Integer duration , Float distance, PricingMode mode){
        if (  mode == null ){
            return 0f;
        }
        Float totalAmount = 0f;

        switch (mode){
            case TIME:
            if ( duration <= 0 || duration == null ){
                return 0f;
            }
            totalAmount = duration * this.pricePerMinute;
            break;

            case DISTANCE:
                if ( distance <= 0 || distance == null ){
                    return 0f;
                }
                totalAmount = distance * this.pricePerKm;
                break;
        }
        return totalAmount;

    }

}
