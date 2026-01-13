package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PricingTest {

    @Test
    void testPricingCreationWithBuilder() {
        Pricing pricing = Pricing.builder()
                .pricingId("PRC-001")
                .pricePerMinute(0.5f)
                .pricePerKm(1.2f)
                .build();

        assertNotNull(pricing);
        assertEquals("PRC-001", pricing.getPricingId());
        assertEquals(0.5f, pricing.getPricePerMinute());
        assertEquals(1.2f, pricing.getPricePerKm());
    }

    @Test
    void testPricingGenerateId() {
        Pricing pricing = new Pricing();
        assertNull(pricing.getPricingId());

        pricing.generateId();

        assertNotNull(pricing.getPricingId());
        assertTrue(pricing.getPricingId().startsWith("PRC-"));
    }
}
