package tn.supcom.cot.iam.controllers.managers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.supcom.cot.iam.controllers.repositories.PaymentRepository;
import tn.supcom.cot.iam.controllers.repositories.RentalRepository;
import tn.supcom.cot.iam.entities.Payment;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentManagerTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RentalRepository rentalRepository;

    @InjectMocks
    private PaymentManager paymentManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetPaymentById() {
        Payment payment = Payment.builder()
                .paymentId("PAY-1")
                .amount(100.0f)
                .dateTime(LocalDateTime.now())
                .transactionReference("TXN-123")
                .paymentMethodId("PM-1")
                .pricingId("PR-1")
                .build();

        when(paymentRepository.findById("PAY-1")).thenReturn(Optional.of(payment));

        Optional<Payment> result = paymentManager.getPaymentById("PAY-1");

        assertTrue(result.isPresent());
        assertEquals("PAY-1", result.get().getPaymentId());
        assertEquals(100.0f, result.get().getAmount());
        verify(paymentRepository, times(1)).findById("PAY-1");
    }

    @Test
    void testCreatePayment() {
        Payment payment = Payment.builder()
                .amount(50.0f)
                .transactionReference("TXN-456")
                .paymentMethodId("PM-2")
                .pricingId("PR-2")
                .build();

        Payment savedPayment = Payment.builder()
                .paymentId("PAY-2")
                .amount(50.0f)
                .transactionReference("TXN-456")
                .paymentMethodId("PM-2")
                .pricingId("PR-2")
                .dateTime(LocalDateTime.now())
                .build();

        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

        Payment result = paymentManager.createPayment(payment);

        assertNotNull(result.getPaymentId());
        assertEquals(50.0f, result.getAmount());
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    void testUpdatePayment() {
        Payment payment = Payment.builder()
                .paymentId("PAY-3")
                .amount(75.0f)
                .transactionReference("TXN-789")
                .paymentMethodId("PM-3")
                .pricingId("PR-3")
                .dateTime(LocalDateTime.now())
                .build();

        when(paymentRepository.save(payment)).thenReturn(payment);

        Payment result = paymentManager.updatePayment(payment);

        assertEquals("PAY-3", result.getPaymentId());
        assertEquals(75.0f, result.getAmount());
        verify(paymentRepository, times(1)).save(payment);
    }
}
