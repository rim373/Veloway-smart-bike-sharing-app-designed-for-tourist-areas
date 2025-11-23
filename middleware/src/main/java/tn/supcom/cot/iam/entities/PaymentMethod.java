package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDate;
import java.util.UUID;


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

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }


    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }


}
