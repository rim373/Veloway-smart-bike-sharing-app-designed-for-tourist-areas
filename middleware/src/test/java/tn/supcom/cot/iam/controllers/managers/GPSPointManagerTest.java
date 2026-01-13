package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.GPSPointRepository;
import tn.supcom.cot.iam.entities.GPSPoint;

import java.util.stream.Stream;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class GPSPointManagerTest {

    @Mock
    private GPSPointRepository gpsPointRepository;

    @InjectMocks
    private GPSPointManager gpsPointManager;

    private GPSPoint gps1;
    private GPSPoint gps2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Création d'exemples de GPSPoints
        gps1 = GPSPoint.builder()
                .gpsPointId("GPS-1")
                .latitude(36.8f)
                .longitude(10.1f)
                .build();

        gps2 = GPSPoint.builder()
                .gpsPointId("GPS-2")
                .latitude(36.9f)
                .longitude(10.2f)
                .build();
    }

    @Test
    void testGetGPSPointByID() {
        // Simuler le repository
        when(gpsPointRepository.findAll()).thenReturn(Stream.of(gps1, gps2));

        // Appeler la méthode du manager
        Set<GPSPoint> result = gpsPointManager.getGPSPointByID("GPS-1");

        // Vérification : pour l'instant on récupère tous les GPSPoints
        assertEquals(2, result.size());
        assertEquals(true, result.contains(gps1));
        assertEquals(true, result.contains(gps2));
    }
}
