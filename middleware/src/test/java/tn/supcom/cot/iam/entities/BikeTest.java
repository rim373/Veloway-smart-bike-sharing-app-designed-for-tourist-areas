package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BikeTest {

    @Test
    void testBikeCreationWithBuilder() {
        Bike bike = Bike.builder()
                .serialNumber("SN123")
                .brand("Giant")
                .model("Escape 3")
                .batteryLevel(80)
                .status("available")
                .stationId("ST01")
                .build();

        assertNotNull(bike);
        assertEquals("SN123", bike.getSerialNumber());
        assertEquals("Giant", bike.getBrand());
        assertEquals("Escape 3", bike.getModel());
        assertEquals(80, bike.getBatteryLevel());
        assertEquals("available", bike.getStatus());
        assertEquals("ST01", bike.getStationId());
    }

    @Test
    void testGenerateIdWhenIdIsNull() {
        Bike bike = new Bike();
        assertNull(bike.getBikeId());

        bike.generateId();

        assertNotNull(bike.getBikeId());
        assertTrue(bike.getBikeId().startsWith("BIKE-"));
    }

    @Test
    void testGenerateIdDoesNotOverrideExistingId() {
        Bike bike = new Bike();
        bike.setBikeId("BIKE-EXISTING-123");

        bike.generateId();

        assertEquals("BIKE-EXISTING-123", bike.getBikeId());
    }
}
