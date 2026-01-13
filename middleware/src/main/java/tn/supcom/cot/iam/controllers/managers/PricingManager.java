package tn.supcom.cot.iam.controllers.managers;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.PricingRepository;
import tn.supcom.cot.iam.entities.Pricing;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class PricingManager {
    @Inject
    private PricingRepository pricingRepository;


    public Optional<Pricing> getPricingById(String pricingId) {
        return pricingRepository.findById(pricingId);
    }


    public Set<Pricing> getAllPricings() {
        return pricingRepository.findAll().collect(Collectors.toSet());
    }


    public Pricing createPricing(Pricing pricing) {
        pricing.generateId();
        return pricingRepository.save(pricing);
    }


    public Pricing updatePricing(Pricing pricing) {
        return pricingRepository.save(pricing);
    }


    public boolean deletePricing(String pricingId) {
        Optional<Pricing> optPricing = pricingRepository.findById(pricingId);
        if (optPricing.isPresent()) {
            pricingRepository.deleteById(pricingId);
            return true;
        }
        return false;
    }


    public Float calculateCostByTime(String pricingId, Integer durationMinutes) {
        Optional<Pricing> optPricing = pricingRepository.findById(pricingId);
        if (optPricing.isPresent() && durationMinutes != null) {
            Pricing pricing = optPricing.get();
            return pricing.getPricePerMinute() * durationMinutes;
        }
        return 0f;
    }


    public Float calculateCostByDistance(String pricingId, Float distanceKm) {
        Optional<Pricing> optPricing = pricingRepository.findById(pricingId);
        if (optPricing.isPresent() && distanceKm != null) {
            Pricing pricing = optPricing.get();
            return pricing.getPricePerKm() * distanceKm;
        }
        return 0f;
    }


    public Float calculateTotalCost(String pricingId, Integer durationMinutes, Float distanceKm) {
        Float timeCost = calculateCostByTime(pricingId, durationMinutes);
        Float distanceCost = calculateCostByDistance(pricingId, distanceKm);
        return timeCost + distanceCost;
    }
}