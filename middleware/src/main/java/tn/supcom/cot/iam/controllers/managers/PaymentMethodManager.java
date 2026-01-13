package tn.supcom.cot.iam.controllers.managers;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.PaymentMethodRepository;
import tn.supcom.cot.iam.entities.PaymentMethod;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class PaymentMethodManager {
    @Inject
    private PaymentMethodRepository paymentMethodRepository;


    public Optional<PaymentMethod> getPaymentMethodById(String paymentMethodId) {
        return paymentMethodRepository.findById(paymentMethodId);
    }


    public Set<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.findAll().collect(Collectors.toSet());
    }


    public Set<PaymentMethod> getPaymentMethodsByUserId(String userId) {
        return paymentMethodRepository.findByUserId(userId)
                .collect(Collectors.toSet());
    }


    public PaymentMethod createPaymentMethod(PaymentMethod paymentMethod) {
        paymentMethod.generateId();
        return paymentMethodRepository.save(paymentMethod);
    }


    public PaymentMethod updatePaymentMethod(PaymentMethod paymentMethod) {
        return paymentMethodRepository.save(paymentMethod);
    }


    public boolean deletePaymentMethod(String paymentMethodId) {
        Optional<PaymentMethod> optPaymentMethod = paymentMethodRepository.findById(paymentMethodId);
        if (optPaymentMethod.isPresent()) {
            paymentMethodRepository.deleteById(paymentMethodId);
            return true;
        }
        return false;
    }


    public boolean hasPaymentMethod(String userId) {
        return paymentMethodRepository.findByUserId(userId)
                .findAny()
                .isPresent();
    }


    public long countPaymentMethodsByUser(String userId) {
        return paymentMethodRepository.findByUserId(userId).count();
    }
}