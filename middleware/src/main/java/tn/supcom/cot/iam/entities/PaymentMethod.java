package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDate;

@Entity
public class PaymentMethod {

    @Id
    private String paymentMethodId;

    @Column
    private String cardNumber;

    @Column
    private LocalDate expirationDate;

    public String getPaymentMethodId {
        return paymentMethodId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public LocalDate getExpirationDate() {return expirationDate;}

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    public void setExpirationDate(Date expirationDate) {
        this.expirationDate = expirationDate;
    }

    public boolean validate(){

    }


}
