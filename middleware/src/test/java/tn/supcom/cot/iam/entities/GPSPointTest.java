package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class GPSPointTest {

    @Test
    void testGPSPointCreationWithBuilder() {
        LocalDateTime now = LocalDateTime.now();

        GPSPoint point = GPSPoint.builder()
                .gpsPointId("GPS-123")
                .latitude(36.8065f)
                .longitude(10.1815f)
                .timestamp(now)
                .build();

        assertNotNull(point);
        assertEquals("GPS-123", point.getGpsPointId());
        assertEquals(36.8065f, point.getLatitude());
        assertEquals(10.1815f, point.getLongitude());
        assertEquals(now, point.getTimestamp());
    }

}
