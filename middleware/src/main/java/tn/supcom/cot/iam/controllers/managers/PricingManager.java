package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.PricingRepository;
import tn.supcom.cot.iam.entities.Pricing;

import  java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class PricingManager {
    @Inject
    private PricingRepository pricingRepository;

    public Set<Pricing> getPricingByBikeId(String bikeId) {
        return pricingRepository.findAll().collect(Collectors.toSet());
    }
}
