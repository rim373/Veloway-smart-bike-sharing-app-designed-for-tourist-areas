package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.PaymentRepository;
import tn.supcom.cot.iam.controllers.repositories.RentalRepository;
import tn.supcom.cot.iam.entities.Payment;
import tn.supcom.cot.iam.entities.Rental;


import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;

import java.time.LocalDateTime;
import java.util.UUID;

@Stateless
public class PaymentManager {
    @Inject
    private PaymentRepository paymentRepository;

    @Inject
    private RentalRepository rentalRepository;


    public Optional<Payment> getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId);
    }

    public Payment updatePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment createPayment(Payment payment) {
        payment.generateId();
        payment.setDateTime(LocalDateTime.now());
        return paymentRepository.save(payment);
    }


}
