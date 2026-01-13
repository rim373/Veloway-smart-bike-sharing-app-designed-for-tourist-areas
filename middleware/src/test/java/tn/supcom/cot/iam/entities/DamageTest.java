package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DamageTest {

    @Test
    void testDamageCreationWithBuilder() {
        LocalDateTime now = LocalDateTime.now();

        Damage damage = Damage.builder()
                .description("Scratched frame")
                .repairCost(120.5f)
                .beforePhoto("before.jpg")
                .afterPhoto("after.jpg")
                .confidenceScore(0.95f)
                .bikeId("BIKE-123")
                .rentalId("RENTAL-456")
                .damageStatus("DETECTED")
                .detectionDate(now)
                .repairDate(null)
                .build();

        assertNotNull(damage);
        assertEquals("Scratched frame", damage.getDescription());
        assertEquals(120.5f, damage.getRepairCost());
        assertEquals("before.jpg", damage.getBeforePhoto());
        assertEquals("after.jpg", damage.getAfterPhoto());
        assertEquals(0.95f, damage.getConfidenceScore());
        assertEquals("BIKE-123", damage.getBikeId());
        assertEquals("RENTAL-456", damage.getRentalId());
        assertEquals("DETECTED", damage.getDamageStatus());
        assertEquals(now, damage.getDetectionDate());
        assertNull(damage.getRepairDate());
    }

    @Test
    void testGenerateIdWhenIdIsNull() {
        Damage damage = new Damage();
        assertNull(damage.getDamageId());

        damage.generateId();

        assertNotNull(damage.getDamageId());
        assertTrue(damage.getDamageId().startsWith("DMG-"));
    }

    @Test
    void testGenerateIdDoesNotOverrideExistingId() {
        Damage damage = new Damage();
        damage.setDamageId("DMG-EXISTING-123");

        damage.generateId();

        assertEquals("DMG-EXISTING-123", damage.getDamageId());
    }
}
