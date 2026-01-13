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

@Stateless
public class PaymentManager {
    @Inject
    private PaymentRepository paymentRepository;

    @Inject
    private RentalRepository rentalRepository;

    public Optional<Payment> getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId);
    }


    public Set<Payment> getAllPayments() {
        return paymentRepository.findAll().collect(Collectors.toSet());
    }


    public Set<Payment> getPaymentsByPaymentMethodId(String paymentMethodId) {
        return paymentRepository.findByPaymentMethodId(paymentMethodId)
                .collect(Collectors.toSet());
    }


    public Payment createPayment(Payment payment) {
        payment.generateId();
        payment.setDateTime(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Payment createPaymentForRental(String rentalId, Float amount, String paymentMethodId, String pricingId) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            Rental rental = optRental.get();

            Payment payment = Payment.builder()
                    .amount(amount)
                    .paymentMethodId(paymentMethodId)
                    .pricingId(pricingId)
                    .transactionReference("TXN-" + System.currentTimeMillis())
                    .build();

            payment.generateId();
            payment.setDateTime(LocalDateTime.now());

            Payment savedPayment = paymentRepository.save(payment);


            rental.setPaymentId(savedPayment.getPaymentId());
            rental.setTotalPrice(amount);
            rentalRepository.save(rental);

            return savedPayment;
        }
        return null;
    }


    public Payment updatePayment(Payment payment) {
        return paymentRepository.save(payment);
    }


    public boolean deletePayment(String paymentId) {
        Optional<Payment> optPayment = paymentRepository.findById(paymentId);
        if (optPayment.isPresent()) {
            paymentRepository.deleteById(paymentId);
            return true;
        }
        return false;
    }


    public Float getTotalAmountByPaymentMethod(String paymentMethodId) {
        return paymentRepository.findByPaymentMethodId(paymentMethodId)
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(0f, Float::sum);
    }
}