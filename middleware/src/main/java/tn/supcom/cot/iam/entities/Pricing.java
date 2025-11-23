package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

import java.util.UUID;

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

    public void generateId() {
        if (this.pricingId == null || this.pricingId.isEmpty()) {
            this.pricingId = "PRC-" + UUID.randomUUID().toString();
        }
    }

    public String getPricingId() {
        return pricingId;
    }

    public void setPricingId(String pricingId) {
        this.pricingId = pricingId;
    }

    public Float getPricePerMinute() {
        return pricePerMinute;
    }

    public void setPricePerMinute(Float pricePerMinute) {
        this.pricePerMinute = pricePerMinute;
    }

    public Float getPricePerKm() {
        return pricePerKm;
    }

    public void setPricePerKm(Float pricePerKm) {
        this.pricePerKm = pricePerKm;
    }


}
