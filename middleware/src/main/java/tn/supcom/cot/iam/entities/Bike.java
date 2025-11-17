package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

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

    public String getBikeId() {
        return bikeId;
    }

    public String getSerialNumber(){
        return serialNumber;
    }

    public void setSerialNumber(String SerialNumber) {
        this.serialNumber = SerialNumber;
    }

    public Integer getBatteryLevel{ return batteryLevel}

    public boolean checkAvailability {
        return .
    }
}