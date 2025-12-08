package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.PricingRepository;
import tn.supcom.cot.iam.entities.Pricing;

import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PricingManagerTest {

    @Mock
    private PricingRepository pricingRepository;

    @InjectMocks
    private PricingManager pricingManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetPricingByBikeId() {
        Pricing pricing1 = Pricing.builder()
                .pricingId("PRC1")
                .pricePerMinute(0.5f)
                .pricePerKm(1.0f)
                .build();

        Pricing pricing2 = Pricing.builder()
                .pricingId("PRC2")
                .pricePerMinute(0.7f)
                .pricePerKm(1.2f)
                .build();

        when(pricingRepository.findAll()).thenReturn(Stream.of(pricing1, pricing2));

        Set<Pricing> result = pricingManager.getPricingByBikeId("any-bike-id");

        assertEquals(2, result.size());
        assertTrue(result.contains(pricing1));
        assertTrue(result.contains(pricing2));

        verify(pricingRepository, times(1)).findAll();
    }
}
