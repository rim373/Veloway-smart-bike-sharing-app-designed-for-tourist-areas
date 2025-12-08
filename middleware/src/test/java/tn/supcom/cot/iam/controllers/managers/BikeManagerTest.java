package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.BikeRepository;
import tn.supcom.cot.iam.entities.Bike;

import java.util.Optional;
import java.util.stream.Stream;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BikeManagerTest {

    @Mock
    private BikeRepository bikeRepository;

    @InjectMocks
    private BikeManager bikeManager;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateBike() {
        Bike bike = new Bike();
        bike.generateId();
        when(bikeRepository.save(bike)).thenReturn(bike);

        Bike created = bikeManager.createBike(bike);
        assertNotNull(created);
        assertEquals(bike.getStationId(), created.getStationId());
        verify(bikeRepository, times(1)).save(bike);
    }

    @Test
    void testCheckAvailability() {
        Bike bike = new Bike();
        bike.setStatus("AVAILABLE");
        bike.setBatteryLevel(50);

        when(bikeRepository.findById("B1")).thenReturn(Optional.of(bike));

        boolean available = bikeManager.checkAvailability("B1");
        assertTrue(available);
        verify(bikeRepository, times(1)).findById("B1");
    }

}
