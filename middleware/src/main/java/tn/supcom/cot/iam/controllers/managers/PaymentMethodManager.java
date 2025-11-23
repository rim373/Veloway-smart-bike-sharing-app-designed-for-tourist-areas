package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.PaymentMethodRepository;
import tn.supcom.cot.iam.controllers.repositories.PricingRepository;
import tn.supcom.cot.iam.entities.PaymentMethod;

import  java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;


@Stateless
public class PaymentMethodManager  {
    @Inject
    private PricingRepository pricingRepository;
    @Inject
    private PaymentMethodRepository paymentMethodRepository;

    public Set<PaymentMethod> getPaymentMethodsById(String paymentId) {
        return paymentMethodRepository.findAll().collect(Collectors.toSet());
    }
}
