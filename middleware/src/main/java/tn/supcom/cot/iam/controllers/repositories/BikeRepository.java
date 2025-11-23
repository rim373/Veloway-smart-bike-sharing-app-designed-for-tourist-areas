package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Bike;

import java.util.Optional;
import java.util.stream.Stream;


@Repository
public interface BikeRepository extends CrudRepository<Bike,String> {
    Stream<Bike> findByStatus(String status);
    Stream<Bike> findByStationId(String stationId);
    Optional<Bike> findBySerialNumber(String serialNumber);
}

