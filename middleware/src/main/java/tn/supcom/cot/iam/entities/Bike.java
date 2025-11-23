package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

import java.util.UUID;

@Entity
public class Bike{

    @Id
    private String bikeId;

    @Column
    private String serialNumber;

    @Column
    private String brand;

    @Column
    private String model;

    @Column
    private Integer batteryLevel;

    @Column
    private String status;

    @Column
    private String stationId;

    //ID
    public void generateId() {
        if (this.bikeId == null || this.bikeId.isEmpty()) {
            this.bikeId = "BIKE-" + UUID.randomUUID().toString();
        }
    }


    // Getters et Setters
    public String getBikeId() { return bikeId; }
    public void setBikeId(String bikeId) { this.bikeId = bikeId; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }


}