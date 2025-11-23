package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Payment;
import java.util.stream.Stream;


@Repository
public interface PaymentRepository extends CrudRepository<Payment,String> {
    Stream<Payment> findByPaymentMethodId(String paymentMethodId);
}
