package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StationTest {

    @Test
    void testStationCreationWithBuilder() {
        Station station = Station.builder()
                .stationId("ST-001")
                .name("Central Park Station")
                .address("123 Main St")
                .latitude(40.785091f)
                .longitude(-73.968285f)
                .totalCapacity(20)
                .availableBikes(15)
                .build();

        assertNotNull(station);
        assertEquals("ST-001", station.getStationId());
        assertEquals("Central Park Station", station.getName());
        assertEquals("123 Main St", station.getAddress());
        assertEquals(40.785091f, station.getLatitude());
        assertEquals(-73.968285f, station.getLongitude());
        assertEquals(20, station.getTotalCapacity());
        assertEquals(15, station.getAvailableBikes());
    }

    @Test
    void testStationGenerateId() {
        Station station = new Station();
        assertNull(station.getStationId());

        station.generateId();

        assertNotNull(station.getStationId());
        assertTrue(station.getStationId().startsWith("STATION-"));
    }
}
