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


}
