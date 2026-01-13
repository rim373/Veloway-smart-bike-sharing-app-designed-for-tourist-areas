package tn.supcom.cot.iam.controllers.managers;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.BikeRepository;
import tn.supcom.cot.iam.controllers.repositories.StationRepository;
import tn.supcom.cot.iam.entities.Bike;
import tn.supcom.cot.iam.entities.Station;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class StationManager {
    @Inject
    private StationRepository stationRepository;

    @Inject
    private BikeManager bikeManager;

    public Set<Station> getStationByStationId(String stationId) {
        return stationRepository.findById(stationId)
                .map(Set::of)
                .orElse(Set.of());
    }

    public Set<Station> getAllStations() {
        return stationRepository.findAll().collect(Collectors.toSet());
    }

    public Station createStation(Station station) {
        station.generateId();
        return stationRepository.save(station);
    }

    public Station updateStation(Station station) {
        return stationRepository.save(station);
    }

    public Station updateAvailableBikes(Integer availableBikes, String stationId) {
        Optional<Station> station = stationRepository.findById(stationId);
        if (station.isPresent()) {
            Station optStation = station.get();
            long stationAvailableBikes = bikeManager.countAvailableBikesByStation(stationId);
            optStation.setAvailableBikes((int) stationAvailableBikes);

            return stationRepository.save(optStation);
        }
        return null;
    }

    public boolean hasAvailableBikes(String stationId) {
        long availableBikes = bikeManager.countAvailableBikesByStation(stationId);
        return availableBikes > 0;
    }

}
