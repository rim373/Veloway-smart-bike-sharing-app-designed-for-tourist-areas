package tn.supcom.cot.iam.entities;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class IOTSensorTest {

    @Test
    void testIOTSensorCreationWithBuilder() {
        IOTSensor sensor = IOTSensor.builder()
                .sensorId("SENSOR-001")
                .sensorName("Docking Sensor")
                .sensorDescription("Detects if a bike is docked")
                .sensorType("Proximity")
                .stationId("STATION-123")
                .build();

        assertNotNull(sensor);
        assertEquals("SENSOR-001", sensor.getSensorId());
        assertEquals("Docking Sensor", sensor.getSensorName());
        assertEquals("Detects if a bike is docked", sensor.getSensorDescription());
        assertEquals("Proximity", sensor.getSensorType());
        assertEquals("STATION-123", sensor.getStationId());
    }

}
