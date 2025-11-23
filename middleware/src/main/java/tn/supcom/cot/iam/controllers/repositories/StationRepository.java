package tn.supcom.cot.iam.controllers.repositories;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.DataRepository;
import jakarta.data.repository.Repository;
import tn.supcom.cot.iam.entities.Station;

@Repository
public interface StationRepository extends CrudRepository<Station,String> {

}
