package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.RentalRepository;
import tn.supcom.cot.iam.entities.Rental;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RentalManagerTest {

    @Mock
    private RentalRepository rentalRepository;

    @InjectMocks
    private RentalManager rentalManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRentalsByRentalId() {
        Rental rental1 = Rental.builder()
                .rentalId("R1")
                .bikeId("B1")
                .rentalStatus("ACTIVE")
                .build();
        Rental rental2 = Rental.builder()
                .rentalId("R2")
                .bikeId("B2")
                .rentalStatus("COMPLETED")
                .build();

        when(rentalRepository.findAll()).thenReturn(Stream.of(rental1, rental2));

        Set<Rental> result = rentalManager.getRentalsByRentalId("any-id");

        assertEquals(2, result.size());
        assertTrue(result.contains(rental1));
        assertTrue(result.contains(rental2));

        verify(rentalRepository, times(1)).findAll();
    }

    @Test
    void testStartRental() {
        Rental rental = Rental.builder().rentalId("R1").build();
        when(rentalRepository.findById("R1")).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(i -> i.getArguments()[0]);

        Rental startedRental = rentalManager.startRental("R1");

        assertNotNull(startedRental.getStartDateTime());
        assertEquals("ACTIVE", startedRental.getRentalStatus());
        verify(rentalRepository, times(1)).findById("R1");
        verify(rentalRepository, times(1)).save(startedRental);
    }

    @Test
    void testEndRental() {
        Rental rental = Rental.builder()
                .rentalId("R1")
                .startDateTime(LocalDateTime.now().minusMinutes(30))
                .build();
        when(rentalRepository.findById("R1")).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(i -> i.getArguments()[0]);

        Rental endedRental = rentalManager.endRental("R1", 10.5f, "ST2");

        assertNotNull(endedRental.getEndDateTime());
        assertEquals("COMPLETED", endedRental.getRentalStatus());
        assertEquals(10.5f, endedRental.getDistanceTraveled());
        assertEquals("ST2", endedRental.getEndStationId());
        assertTrue(endedRental.getDuration() > 0);

        verify(rentalRepository, times(1)).findById("R1");
        verify(rentalRepository, times(1)).save(endedRental);
    }

    @Test
    void testHasActiveRental() {
        Rental activeRental = Rental.builder().rentalId("R1").rentalStatus("ACTIVE").build();
        Rental completedRental = Rental.builder().rentalId("R2").rentalStatus("COMPLETED").build();

        when(rentalRepository.findByUserId("U1")).thenReturn(Stream.of(activeRental, completedRental));

        assertTrue(rentalManager.hasActiveRental("U1"));
        verify(rentalRepository, times(1)).findByUserId("U1");
    }

    @Test
    void testAddInitialPhoto() {
        Rental rental = Rental.builder().rentalId("R1").build();
        when(rentalRepository.findById("R1")).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(i -> i.getArguments()[0]);

        Rental updatedRental = rentalManager.addInitialPhoto("R1", "url1");

        assertEquals("url1", updatedRental.getInitialPhoto());
        verify(rentalRepository).save(updatedRental);
    }

    @Test
    void testAddFinalPhoto() {
        Rental rental = Rental.builder().rentalId("R1").build();
        when(rentalRepository.findById("R1")).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(i -> i.getArguments()[0]);

        Rental updatedRental = rentalManager.addFinalPhoto("R1", "url2");

        assertEquals("url2", updatedRental.getFinalPhoto());
        verify(rentalRepository).save(updatedRental);
    }
}
