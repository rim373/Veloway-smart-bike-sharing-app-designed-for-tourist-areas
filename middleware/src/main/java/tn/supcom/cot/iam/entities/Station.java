package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

import java.util.UUID;

@Entity
public class Station{

    @Id
    private String stationId;

    @Column
    private String name;

    @Column
    private String address;

    @Column
    private Float latitude;

    @Column
    private Float longitude;

    @Column
    private Integer totalCapacity;

    @Column
    private Integer availableBikes;

    //Id Generation
    public void generateId() {
        if (this.stationId == null || this.stationId.isEmpty()) {
            this.stationId = "STATION-" + UUID.randomUUID().toString();
        }
    }


    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Float getLatitude() { return latitude; }
    public void setLatitude(Float latitude) { this.latitude = latitude; }

    public Float getLongitude() { return longitude; }
    public void setLongitude(Float longitude) { this.longitude = longitude; }

    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }

    public Integer getAvailableBikes() { return availableBikes; }
    public void setAvailableBikes(Integer availableBikes) {
        this.availableBikes = availableBikes;
    }


}