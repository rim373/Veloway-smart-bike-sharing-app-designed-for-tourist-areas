package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Maintenance;

import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface MaintenanceRepository extends CrudRepository<Maintenance, String> {
    Stream<Maintenance> findByBikeId(String bikeId);
}
