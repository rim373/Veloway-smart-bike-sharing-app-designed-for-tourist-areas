package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Damage;

import java.util.stream.Stream;


@Repository
public interface DamageRepository extends CrudRepository<Damage,String> {
    Stream<Damage> findByBikeId(String bikeId);
    Stream<Damage> findByRentalId(String rentalId);
    Stream<Damage> findByDamageStatus(String damageStatus);
}
