package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Rental;

import java.util.stream.Stream;

@Repository
public interface RentalRepository extends CrudRepository<Rental,String> {
    Stream<Rental> findByUserId(String userId);
    Stream<Rental> findByBikeId(String bikeId);
    Stream<Rental> findByRentalStatus(String status);
    Stream<Rental> findByStartStationId(String startStationId);
    Stream<Rental> findByEndStationId(String endStationId);
}
