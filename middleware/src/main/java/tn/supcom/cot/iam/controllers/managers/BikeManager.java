package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.BikeRepository;
import tn.supcom.cot.iam.entities.Bike;

import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class BikeManager {
    @Inject
    private BikeRepository bikeRepository;

    public Set<Bike> getBikeByBikeId(String bikeId) {
        return bikeRepository.findAll().collect(Collectors.toSet());
    }

    public Set<Bike> getBikeByStationId(String stationId) {
        return bikeRepository.findByStationId(stationId).collect(Collectors.toSet());
    }

    public Set<Bike> getBikeByStatus(String status){
        return bikeRepository.findByStatus(status).collect(Collectors.toSet());
    }

    public Bike createBike(Bike bike){
        bike.generateId();
        return bikeRepository.save(bike);
    }

    public Bike updateBike(Bike bike){
        return bikeRepository.save(bike);
    }

    public Bike updateBikeStatus(String bikeId, String status){
        Optional<Bike> optBike = bikeRepository.findById(bikeId);
        if (optBike.isPresent()){
            Bike bike=optBike.get();
            bike.setStatus(status);
            return bikeRepository.save(bike);
        }
        return null;
    }

    public boolean checkAvailability(String bikeId){
        Optional<Bike> optBike = bikeRepository.findById(bikeId);
        if (optBike.isPresent()){
            Bike bike=optBike.get();
            return "AVAILABLE".equals(bike.getStatus()) &&
                    bike.getBatteryLevel()!= null &&
                    bike.getBatteryLevel() > 20;
        }
        return false;
    }

    public Set<Bike> getAvailableBikesByStation(String stationId){
        return bikeRepository.findByStationId(stationId)
                .filter(bike -> "AVAILABLE".equals(bike.getStatus()))
                .filter(bike -> bike.getBatteryLevel() != null && bike.getBatteryLevel() > 20)
                .collect(Collectors.toSet());
    }

    public long countAvailableBikesByStation(String stationId){
        return bikeRepository.findByStationId(stationId)
                .filter(bike -> "AVAILABLE".equals(bike.getStatus()))
                .filter(bike -> bike.getBatteryLevel() != null && bike.getBatteryLevel() > 20)
                .count();
    }
}
