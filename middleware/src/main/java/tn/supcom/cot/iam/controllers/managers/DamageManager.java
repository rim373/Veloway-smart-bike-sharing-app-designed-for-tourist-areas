package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.DamageRepository;
import tn.supcom.cot.iam.entities.Damage;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class DamageManager {
    @Inject
    private DamageRepository damageRepository;


    public Optional<Damage> getDamageById(String damageId) {
        return damageRepository.findById(damageId);
    }


    public Set<Damage> getAllDamages() {
        return damageRepository.findAll().collect(Collectors.toSet());
    }


    public Set<Damage> getDamagesByBikeId(String bikeId) {
        return damageRepository.findByBikeId(bikeId).collect(Collectors.toSet());
    }


    public Set<Damage> getDamagesByRentalId(String rentalId) {
        return damageRepository.findByRentalId(rentalId).collect(Collectors.toSet());
    }


    public Set<Damage> getDamagesByStatus(String status) {
        return damageRepository.findByDamageStatus(status).collect(Collectors.toSet());
    }


    public Damage createDamage(Damage damage) {
        damage.generateId();
        if (damage.getDetectionDate() == null) {
            damage.setDetectionDate(LocalDateTime.now());
        }
        if (damage.getDamageStatus() == null) {
            damage.setDamageStatus("DETECTED");
        }
        return damageRepository.save(damage);
    }


    public Damage updateDamage(Damage damage) {
        return damageRepository.save(damage);
    }


    public boolean deleteDamage(String damageId) {
        Optional<Damage> optDamage = damageRepository.findById(damageId);
        if (optDamage.isPresent()) {
            damageRepository.deleteById(damageId);
            return true;
        }
        return false;
    }

    public Damage confirmDamage(String damageId) {
        Optional<Damage> optDamage = damageRepository.findById(damageId);
        if (optDamage.isPresent()) {
            Damage damage = optDamage.get();
            damage.setDamageStatus("CONFIRMED");
            return damageRepository.save(damage);
        }
        return null;
    }


    public Damage markAsRepaired(String damageId) {
        Optional<Damage> optDamage = damageRepository.findById(damageId);
        if (optDamage.isPresent()) {
            Damage damage = optDamage.get();
            damage.setDamageStatus("REPAIRED");
            damage.setRepairDate(LocalDateTime.now());
            return damageRepository.save(damage);
        }
        return null;
    }


    public Damage addBeforePhoto(String damageId, String photoUrl) {
        Optional<Damage> optDamage = damageRepository.findById(damageId);
        if (optDamage.isPresent()) {
            Damage damage = optDamage.get();
            damage.setBeforePhoto(photoUrl);
            return damageRepository.save(damage);
        }
        return null;
    }


    public Damage addAfterPhoto(String damageId, String photoUrl) {
        Optional<Damage> optDamage = damageRepository.findById(damageId);
        if (optDamage.isPresent()) {
            Damage damage = optDamage.get();
            damage.setAfterPhoto(photoUrl);
            return damageRepository.save(damage);
        }
        return null;
    }


    public Float getTotalRepairCostByBike(String bikeId) {
        return damageRepository.findByBikeId(bikeId)
                .map(Damage::getRepairCost)
                .filter(cost -> cost != null)
                .reduce(0f, Float::sum);
    }


    public long countUnrepairedDamagesByBike(String bikeId) {
        return damageRepository.findByBikeId(bikeId)
                .filter(damage -> !"REPAIRED".equals(damage.getDamageStatus()))
                .count();
    }
}