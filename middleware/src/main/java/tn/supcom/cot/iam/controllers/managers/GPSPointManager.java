package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.GPSPointRepository;
import tn.supcom.cot.iam.entities.GPSPoint;

import java.util.stream.Collectors;
import java.util.Set;

@Stateless
public class GPSPointManager {
    @Inject
    private GPSPointRepository gpsPointRepository;

    public Set<GPSPoint> getGPSPointByID(String gpsPointId) {
        return gpsPointRepository.findAll().collect(Collectors.toSet());
    }
}
