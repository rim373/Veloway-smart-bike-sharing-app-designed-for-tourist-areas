package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PaymentTest {

    @Test
    void testPaymentCreationWithBuilder() {
        LocalDateTime now = LocalDateTime.now();

        Payment payment = Payment.builder()
                .paymentId("PAY-001")
                .amount(50.0f)
                .dateTime(now)
                .transactionReference("TXN12345")
                .paymentMethodId("PM-001")
                .pricingId("PRC-001")
                .build();

        assertNotNull(payment);
        assertEquals("PAY-001", payment.getPaymentId());
        assertEquals(50.0f, payment.getAmount());
        assertEquals(now, payment.getDateTime());
        assertEquals("TXN12345", payment.getTransactionReference());
        assertEquals("PM-001", payment.getPaymentMethodId());
        assertEquals("PRC-001", payment.getPricingId());
    }

    @Test
    void testPaymentGenerateId() {
        Payment payment = new Payment();
        assertNull(payment.getPaymentId());

        payment.generateId();

        assertNotNull(payment.getPaymentId());
        assertTrue(payment.getPaymentId().startsWith("PAY-"));
    }
}
