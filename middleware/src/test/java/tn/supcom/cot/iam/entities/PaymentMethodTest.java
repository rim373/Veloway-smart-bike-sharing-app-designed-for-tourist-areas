package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class PaymentMethodTest {

    @Test
    void testPaymentMethodCreationWithBuilder() {
        LocalDate expDate = LocalDate.of(2030, 12, 31);

        PaymentMethod pm = PaymentMethod.builder()
                .paymentMethodId("PMT-001")
                .cardNumber("1234567890123456")
                .expirationDate(expDate)
                .userId("USER-001")
                .cardType("Visa")
                .build();

        assertNotNull(pm);
        assertEquals("PMT-001", pm.getPaymentMethodId());
        assertEquals("1234567890123456", pm.getCardNumber());
        assertEquals(expDate, pm.getExpirationDate());
        assertEquals("USER-001", pm.getUserId());
        assertEquals("Visa", pm.getCardType());
    }

    @Test
    void testPaymentMethodGenerateId() {
        PaymentMethod pm = new PaymentMethod();
        assertNull(pm.getPaymentMethodId());

        pm.generateId();

        assertNotNull(pm.getPaymentMethodId());
        assertTrue(pm.getPaymentMethodId().startsWith("PMT-"));
    }
}
