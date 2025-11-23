package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.GPSPoint;

@Repository
public interface GPSPointRepository extends CrudRepository<GPSPoint, String> {
}
