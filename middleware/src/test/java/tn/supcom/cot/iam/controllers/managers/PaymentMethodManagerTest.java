package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.PaymentMethodRepository;
import tn.supcom.cot.iam.controllers.repositories.PricingRepository;
import tn.supcom.cot.iam.entities.PaymentMethod;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentMethodManagerTest {

    @Mock
    private PaymentMethodRepository paymentMethodRepository;

    @Mock
    private PricingRepository pricingRepository;

    @InjectMocks
    private PaymentMethodManager paymentMethodManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetPaymentMethodsById() {
        PaymentMethod method1 = PaymentMethod.builder()
                .paymentMethodId("PMT-1")
                .cardNumber("1234567890123456")
                .expirationDate(LocalDate.of(2025, 12, 31))
                .userId("USER-1")
                .cardType("VISA")
                .build();

        PaymentMethod method2 = PaymentMethod.builder()
                .paymentMethodId("PMT-2")
                .cardNumber("9876543210987654")
                .expirationDate(LocalDate.of(2026, 6, 30))
                .userId("USER-2")
                .cardType("MASTERCARD")
                .build();

        when(paymentMethodRepository.findAll()).thenReturn(Stream.of(method1, method2));

        Set<PaymentMethod> result = paymentMethodManager.getPaymentMethodsById("any-id");

        assertEquals(2, result.size());
        assertTrue(result.contains(method1));
        assertTrue(result.contains(method2));

        verify(paymentMethodRepository, times(1)).findAll();
    }
}
