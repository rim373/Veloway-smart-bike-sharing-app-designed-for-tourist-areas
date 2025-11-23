package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.DamageRepository;
import tn.supcom.cot.iam.entities.Damage;

import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class DamageManager {
    @Inject
    private DamageRepository damageRepository;

    public Set<Damage> getDamageByDamageId(String damageId) {
        return damageRepository.findAll().collect(Collectors.toSet());
    }
}
