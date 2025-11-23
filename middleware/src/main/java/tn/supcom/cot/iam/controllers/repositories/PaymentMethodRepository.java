package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.PaymentMethod;

import java.util.stream.Stream;

@Repository
public interface PaymentMethodRepository extends CrudRepository<PaymentMethod,String> {
    Stream<PaymentMethod> findByUserId(String userId);
}
