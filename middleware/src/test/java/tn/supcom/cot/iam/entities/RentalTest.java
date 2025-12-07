package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RentalTest {

    @Test
    void testRentalCreationWithBuilder() {
        LocalDateTime start = LocalDateTime.of(2025, 12, 7, 10, 0);
        LocalDateTime end = LocalDateTime.of(2025, 12, 7, 11, 0);

        Rental rental = Rental.builder()
                .rentalId("RENTAL-001")
                .startDateTime(start)
                .endDateTime(end)
                .duration(60)
                .distanceTraveled(12.5f)
                .bikeId("BIKE-001")
                .initialPhoto("initial.jpg")
                .finalPhoto("final.jpg")
                .paymentId("PAY-001")
                .userId("USER-001")
                .startStationId("ST-001")
                .endStationId("ST-002")
                .rentalStatus("COMPLETED")
                .totalPrice(15.0f)
                .build();

        assertNotNull(rental);
        assertEquals("RENTAL-001", rental.getRentalId());
        assertEquals(start, rental.getStartDateTime());
        assertEquals(end, rental.getEndDateTime());
        assertEquals(60, rental.getDuration());
        assertEquals(12.5f, rental.getDistanceTraveled());
        assertEquals("BIKE-001", rental.getBikeId());
        assertEquals("initial.jpg", rental.getInitialPhoto());
        assertEquals("final.jpg", rental.getFinalPhoto());
        assertEquals("PAY-001", rental.getPaymentId());
        assertEquals("USER-001", rental.getUserId());
        assertEquals("ST-001", rental.getStartStationId());
        assertEquals("ST-002", rental.getEndStationId());
        assertEquals("COMPLETED", rental.getRentalStatus());
        assertEquals(15.0f, rental.getTotalPrice());
    }

    @Test
    void testRentalGenerateId() {
        Rental rental = new Rental();
        assertNull(rental.getRentalId());

        rental.generateId();

        assertNotNull(rental.getRentalId());
        assertTrue(rental.getRentalId().startsWith("RENTAL-"));
    }
}
