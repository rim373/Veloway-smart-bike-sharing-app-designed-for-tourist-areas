package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;
import java.time.LocalDateTime;

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

    public String getPaymentId {
        return paymentId;
    }

    public LocalDateTime getDateTime(){
        return dateTime;
    }

    public Float getAmount(){
        return amount;
    }

    public String getTransactionReference(){
        return transactionReference;
    }

    public String getPaymentMethodId() {return paymentMethodId;}

    public String getPricingId() {return pricingId;}

    public void setAmount(Float Amount){
        this.amount = Amount;
    }

    public void setDateTime( LocalDateTime DateTime){
        this.dateTime = DateTime;
    }

    public void setTransactionReference(String TransactionReference){
        this.transactionReference = TransactionReference;
    }

    public void setPaymentMethodId(String PaymentMethodId){
        this.paymentMethodId = PaymentMethodId;
    }

    public void setPricingId(String PricingId){
        this.pricingId = PricingId;
    }

    public boolean processPayment(){
        if ( this.amount != null && this.amount > 0 && this.transactionReference == null){
            this.dateTime = LocalDateTime.now();
            return true;
        }
        return false;
    }

    public boolean refund(){
        if (this.dateTime != null && this.amount != null && this.amount > 0 && this.transactionReference != null ){
            this.amount = 0f;
            this.transactionReference = null;
            this.dateTime = LocalDateTime.now();
            return true;
        }
        return false;
    }
}
