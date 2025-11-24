package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Pricing;

@Repository
public interface PricingRepository extends CrudRepository<Pricing,String> {
}
