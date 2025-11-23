package tn.supcom.cot.iam.controllers.managers;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.RentalRepository;
import tn.supcom.cot.iam.entities.Rental;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.Duration;

@Stateless
public class RentalManager {
    @Inject
    private RentalRepository rentalRepository;

    public Set<Rental> getRentalsByRentalId(String rentalId) {
        return rentalRepository.findAll().collect(Collectors.toSet());
    }

    public Set<Rental> getRentalsByUserId(String userId) {
        return rentalRepository.findByUserId(userId).collect(Collectors.toSet());
    }

    public Set<Rental> getRentalsByBikeId(String bikeId) {
        return rentalRepository.findByBikeId(bikeId).collect(Collectors.toSet());
    }

    public Set<Rental> getRentalByRentalStatus(String rentalStatus) {
        return rentalRepository.findByRentalStatus(rentalStatus).collect(Collectors.toSet());
    }

    public Rental createRental(Rental rental) {
        rental.generateId();
        return rentalRepository.save(rental);
    }

    public Rental updateRental(Rental rental) {
        return rentalRepository.save(rental);
    }
    public void deleteRental(String rentalId) {
        rentalRepository.deleteById(rentalId);
    }

    //Starting Rental
    public Rental startRental(String rentalId) {
        Optional<Rental> optionalRental = rentalRepository.findById(rentalId);
        if (optionalRental.isPresent()) {
            Rental rental = optionalRental.get();

            if (rental.getStartDateTime()== null){
                rental.setStartDateTime(LocalDateTime.now());
                rental.setRentalStatus("ACTIVE");
            }

            return rentalRepository.save(rental);
        }
        return null;
    }

    public Rental endRental(String rentalId, Float distanceTraveled, String endStationId) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            Rental rental = optRental.get();

            // End Rental Logic
            if (rental.getStartDateTime() != null && rental.getEndDateTime() == null) {
                rental.setEndDateTime(LocalDateTime.now());
                rental.setDuration((int) Duration.between(rental.getStartDateTime(),
                        rental.getEndDateTime()).toMinutes());
                rental.setRentalStatus("COMPLETED");
                rental.setDistanceTraveled(distanceTraveled);
                rental.setEndStationId(endStationId);

                // Amount
                //calculateAmount(rental);

                return rentalRepository.save(rental);
            }
        }
        return null;
    }

    public Optional<Rental> getActiveRentalByUserId(String userId) {
        return rentalRepository.findByUserId(userId)
                .filter(rental -> "ACTIVE".equals(rental.getRentalStatus()))
                .findFirst();
    }

    public boolean hasActiveRental(String userId) {
        return rentalRepository.findByUserId(userId)
                .anyMatch(rental -> "ACTIVE".equals(rental.getRentalStatus()));
    }

    public Rental addInitialPhoto(String rentalId, String photoUrl) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            Rental rental = optRental.get();
            rental.setInitialPhoto(photoUrl);
            return rentalRepository.save(rental);
        }
        return null;
    }

    public Rental addFinalPhoto(String rentalId, String photoUrl) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            Rental rental = optRental.get();
            rental.setFinalPhoto(photoUrl);
            return rentalRepository.save(rental);
        }
        return null;
    }





}
