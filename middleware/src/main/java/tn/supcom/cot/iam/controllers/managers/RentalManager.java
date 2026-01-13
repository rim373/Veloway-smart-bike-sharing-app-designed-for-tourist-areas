package tn.supcom.cot.iam.controllers.managers;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.RentalRepository;
import tn.supcom.cot.iam.entities.Payment;
import tn.supcom.cot.iam.entities.Rental;
import tn.supcom.cot.iam.entities.Bike;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.Duration;

@Stateless
public class RentalManager {
    @Inject
    private RentalRepository rentalRepository;

    @Inject
    private CloudinaryManager cloudinaryManager;

    @Inject
    private BikeManager bikeManager;

    @Inject
    private StationManager stationManager;

    @Inject
    private PaymentManager paymentManager;

    @Inject
    private PricingManager pricingManager;

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

            // End Rental
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

    public Rental addInitialPhotoFile(String rentalId, File photoFile) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            try {
                Rental rental = optRental.get();

                // Upload vers Cloudinary
                String photoUrl = cloudinaryManager.uploadImage(
                        photoFile,
                        "veloway/rentals/" + rentalId + "/initial"
                );

                rental.setInitialPhoto(photoUrl);
                return rentalRepository.save(rental);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload initial photo", e);
            }
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

    public Rental addFinalPhotoFile(String rentalId, File photoFile) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (optRental.isPresent()) {
            try {
                Rental rental = optRental.get();

                // Upload vers Cloudinary
                String photoUrl = cloudinaryManager.uploadImage(
                        photoFile,
                        "veloway/rentals/" + rentalId + "/final"
                );

                rental.setFinalPhoto(photoUrl);
                return rentalRepository.save(rental);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload final photo", e);
            }
        }
        return null;
    }

    public Rental reserveBikeAtStation(String userId, String stationId) {
        // 1. Verify if user has active rental
        if (hasActiveRental(userId)) {
            throw new IllegalStateException("User already has an active rental");
        }

        // 2. list of available bike
        Set<Bike> availableBikes = bikeManager.getAvailableBikesByStation(stationId);
        if (availableBikes.isEmpty()) {
            throw new IllegalStateException("No bikes available at this station");
        }

        // 3. select the bike with the highest battery level
        Bike selectedBike = availableBikes.stream()
                .max((b1, b2) -> Integer.compare(b1.getBatteryLevel(), b2.getBatteryLevel()))
                .orElseThrow(() -> new IllegalStateException("Failed to select bike"));

        // 4. Create rental
        Rental rental = Rental.builder()
                .userId(userId)
                .bikeId(selectedBike.getBikeId())
                .startStationId(stationId)
                .rentalStatus("RESERVED")
                .build();

        Rental savedRental = createRental(rental);

        // 5. Reserve the bike
        bikeManager.updateBikeStatus(selectedBike.getBikeId(), "RESERVED");

        // 6. update available bikes in the station
        stationManager.updateAvailableBikes(null, stationId);

        return savedRental;
    }

    public Rental completeRental(String rentalId, String endStationId) {
        Optional<Rental> optRental = rentalRepository.findById(rentalId);
        if (!optRental.isPresent()) {
            throw new IllegalArgumentException("Rental not found");
        }

        Rental rental = optRental.get();

        if (!"ACTIVE".equals(rental.getRentalStatus())) {
            throw new IllegalStateException("Rental is not active");
        }

        // 1. Calculate duration
        rental.setEndDateTime(LocalDateTime.now());
        int durationMinutes = (int) Duration.between(
                rental.getStartDateTime(),
                rental.getEndDateTime()
        ).toMinutes();
        rental.setDuration(durationMinutes);

        // 2. Calculate distance
        Float distanceTraveled = durationMinutes * 0.2f; // Approximation : 0.2 km par minute
        rental.setDistanceTraveled(distanceTraveled);

        // 3. Calculate price
        Float pricePerMinute = 0.2f;
        Float pricePerKm = 1.0f;
        Float totalPrice = (durationMinutes * pricePerMinute) + (distanceTraveled * pricePerKm);
        rental.setTotalPrice(totalPrice);

        // 4. finish rental
        rental.setEndStationId(endStationId);
        rental.setRentalStatus("COMPLETED");
        Rental savedRental = rentalRepository.save(rental);

        // 5. liberate the bike
        Set<Bike> bikes = bikeManager.getBikeByBikeId(rental.getBikeId());
        if (!bikes.isEmpty()) {
            Bike bike = bikes.iterator().next();
            bike.setStatus("AVAILABLE");
            bike.setStationId(endStationId);
            bikeManager.updateBike(bike);
        }

        // 6. update station
        stationManager.updateAvailableBikes(null, rental.getStartStationId());
        stationManager.updateAvailableBikes(null, endStationId);

        // 7. create payment
        try {
            Payment payment = Payment.builder()
                    .amount(totalPrice)
                    .paymentMethodId("PMT-DEFAULT")
                    .pricingId("PRICING-DEFAULT")
                    .transactionReference("AUTO-" + System.currentTimeMillis())
                    .build();
            paymentManager.createPayment(payment);

            // Lier le paiement à la location
            savedRental.setPaymentId(payment.getPaymentId());
            savedRental = rentalRepository.save(savedRental);
        } catch (Exception e) {
            // Log l'erreur mais ne pas bloquer la fin de location
            System.err.println("Failed to create payment: " + e.getMessage());
        }

        return savedRental;
    }

}
