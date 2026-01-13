package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MaintenanceTest {

    @Test
    void testMaintenanceCreationWithBuilder() {
        LocalDateTime now = LocalDateTime.now();

        Maintenance m = Maintenance.builder()
                .maintenanceId("MNT-001")
                .date(now)
                .cost(150.0f)
                .bikeId("BIKE-123")
                .description("Brake replacement")
                .build();

        assertNotNull(m);
        assertEquals("MNT-001", m.getMaintenanceId());
        assertEquals(now, m.getDate());
        assertEquals(150.0f, m.getCost());
        assertEquals("BIKE-123", m.getBikeId());
        assertEquals("Brake replacement", m.getDescription());
    }

    @Test
    void testMaintenanceGenerateId() {
        Maintenance m = new Maintenance();
        assertNull(m.getMaintenanceId());

        m.generateId();  // utilise la méthode generateId()

        assertNotNull(m.getMaintenanceId());
        assertTrue(m.getMaintenanceId().startsWith("MNT-"));
    }
}
