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
public class Payment{

    @Id
    private String paymentId;

    @Column
    private Float amount;

    @Column
    private LocalDateTime dateTime;

    @Column
    private String transactionReference;

    @Column
    private String paymentMethodId;

    @Column
    private String pricingId;


    public void generateId() {
        if (this.paymentId == null || this.paymentId.isEmpty()) {
            this.paymentId = "PAY-" + UUID.randomUUID().toString();
        }
    }

}
