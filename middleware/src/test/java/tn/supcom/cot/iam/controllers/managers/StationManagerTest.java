package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.StationRepository;
import tn.supcom.cot.iam.entities.Station;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StationManagerTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private BikeManager bikeManager;

    @InjectMocks
    private StationManager stationManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetStationByStationId() {
        Station station1 = Station.builder().stationId("ST1").name("Station 1").build();
        Station station2 = Station.builder().stationId("ST2").name("Station 2").build();

        when(stationRepository.findAll()).thenReturn(Stream.of(station1, station2));

        Set<Station> result = stationManager.getStationByStationId("ST1");

        assertEquals(2, result.size());
        assertTrue(result.contains(station1));
        assertTrue(result.contains(station2));
        verify(stationRepository, times(1)).findAll();
    }

    @Test
    void testCreateStation() {
        Station station = Station.builder().name("New Station").build();
        when(stationRepository.save(any(Station.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Station created = stationManager.createStation(station);

        assertNotNull(created.getStationId());
        assertEquals("New Station", created.getName());
        verify(stationRepository, times(1)).save(station);
    }

    @Test
    void testUpdateStation() {
        Station station = Station.builder().stationId("ST1").name("Old Name").build();
        when(stationRepository.save(station)).thenReturn(station);

        Station updated = stationManager.updateStation(station);

        assertEquals("ST1", updated.getStationId());
        verify(stationRepository, times(1)).save(station);
    }

    @Test
    void testUpdateAvailableBikes() {
        Station station = Station.builder().stationId("ST1").availableBikes(0).build();
        when(stationRepository.findById("ST1")).thenReturn(Optional.of(station));
        when(bikeManager.countAvailableBikesByStation("ST1")).thenReturn(5L);
        when(stationRepository.save(station)).thenReturn(station);

        Station updated = stationManager.updateAvailableBikes(0, "ST1");

        assertNotNull(updated);
        assertEquals(5, updated.getAvailableBikes());
        verify(stationRepository).findById("ST1");
        verify(bikeManager).countAvailableBikesByStation("ST1");
        verify(stationRepository).save(station);
    }

    @Test
    void testHasAvailableBikes() {
        when(bikeManager.countAvailableBikesByStation("ST1")).thenReturn(3L);

        assertTrue(stationManager.hasAvailableBikes("ST1"));
        verify(bikeManager, times(1)).countAvailableBikesByStation("ST1");
    }
}
