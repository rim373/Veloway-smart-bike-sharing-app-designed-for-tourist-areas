package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.DamageRepository;
import tn.supcom.cot.iam.entities.Damage;

import java.util.stream.Stream;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class DamageManagerTest {

    @Mock
    private DamageRepository damageRepository;

    @InjectMocks
    private DamageManager damageManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDamageByDamageId() {
        // Création de dommages factices
        Damage damage1 = Damage.builder().damageId("DMG-1").description("Scratch").build();
        Damage damage2 = Damage.builder().damageId("DMG-2").description("Broken pedal").build();

        // Mock du repository
        when(damageRepository.findAll()).thenReturn(Stream.of(damage1, damage2));

        // Appel de la méthode à tester
        Set<Damage> damages = damageManager.getDamageByDamageId("DMG-1");

        // Vérification
        assertEquals(2, damages.size(), "Le set doit contenir 2 dommages");
    }
}
