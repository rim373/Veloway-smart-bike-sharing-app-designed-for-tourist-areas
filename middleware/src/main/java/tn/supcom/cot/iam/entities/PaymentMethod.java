package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDate;
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
public class PaymentMethod {

    @Id
    private String paymentMethodId;

    @Column
    private String cardNumber;

    @Column
    private LocalDate expirationDate;

    @Column
    private String userId;

    @Column
    private String cardType;

    public void generateId() {
        if (this.paymentMethodId == null || this.paymentMethodId.isEmpty()) {
            this.paymentMethodId = "PMT-" + UUID.randomUUID().toString();
        }
    }

}
