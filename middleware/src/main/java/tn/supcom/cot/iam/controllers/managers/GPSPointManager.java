package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.GPSPointRepository;
import tn.supcom.cot.iam.entities.GPSPoint;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;

@Stateless
public class GPSPointManager {
    @Inject
    private GPSPointRepository gpsPointRepository;


    public Optional<GPSPoint> getGPSPointById(String gpsPointId) {
        return gpsPointRepository.findById(gpsPointId);
    }


    public Set<GPSPoint> getAllGPSPoints() {
        return gpsPointRepository.findAll().collect(Collectors.toSet());
    }


    public GPSPoint createGPSPoint(GPSPoint gpsPoint) {
        if (gpsPoint.getGpsPointId() == null || gpsPoint.getGpsPointId().isEmpty()) {
            gpsPoint.setGpsPointId("GPS-" + UUID.randomUUID().toString());
        }
        if (gpsPoint.getTimestamp() == null) {
            gpsPoint.setTimestamp(LocalDateTime.now());
        }
        return gpsPointRepository.save(gpsPoint);
    }


    public GPSPoint createGPSPointWithCoordinates(Float latitude, Float longitude) {
        GPSPoint gpsPoint = GPSPoint.builder()
                .gpsPointId("GPS-" + UUID.randomUUID().toString())
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(LocalDateTime.now())
                .build();
        return gpsPointRepository.save(gpsPoint);
    }


    public GPSPoint updateGPSPoint(GPSPoint gpsPoint) {
        return gpsPointRepository.save(gpsPoint);
    }


    public boolean deleteGPSPoint(String gpsPointId) {
        Optional<GPSPoint> optGPSPoint = gpsPointRepository.findById(gpsPointId);
        if (optGPSPoint.isPresent()) {
            gpsPointRepository.deleteById(gpsPointId);
            return true;
        }
        return false;
    }


    public Float calculateDistance(String gpsPointId1, String gpsPointId2) {
        Optional<GPSPoint> point1 = gpsPointRepository.findById(gpsPointId1);
        Optional<GPSPoint> point2 = gpsPointRepository.findById(gpsPointId2);

        if (point1.isPresent() && point2.isPresent()) {
            return calculateDistanceInKm(
                    point1.get().getLatitude(),
                    point1.get().getLongitude(),
                    point2.get().getLatitude(),
                    point2.get().getLongitude()
            );
        }
        return 0f;
    }


    private Float calculateDistanceInKm(Float lat1, Float lon1, Float lat2, Float lon2) {
        final int EARTH_RADIUS = 6371; // Rayon de la Terre en km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (float) (EARTH_RADIUS * c);
    }
}