package tn.supcom.cot.iam.entities;


import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

@Entity
public class Station{

    @Id
    private String stationId;

    @Column
    private String name;

    @Column
    private Float latitude;

    @Column
    private Float longitude;

    @Column
    private Integer totalCapacity;

    @Column
    private Integer availableBikes;

    public String getStationId() {return stationId;}

    public String getName() {return name;}

    public Float getLatitude() {return latitude;}

    public Float getLongitude() {return longitude;}

    public Integer getTotalCapacity() {return totalCapacity;}

    public Integer getAvailableBikes() {return availableBikes;}

    public void setTotalCapacity(Integer totalCapacity) {this.totalCapacity = totalCapacity;}

    public void setAvailableBikes(Integer availableBikes) {this.availableBikes = availableBikes;}

    public void setLongitude(Float longitude) {this.longitude = longitude;}

    public void setLatitude(Float latitude) {this.latitude = latitude;}

    public void setName(String name) {this.name = name;}

    public boolean checkAvailability(){
        return availableBikes != null && availableBikes > 0;
    }

    public Float calculateDistance(Float lat, Float lng) {
        if (lat == null || lng == null || this.latitude == null || this.longitude == null) {
            return null;
        }

        double R = 6371; // Rayon de la terre en km

        double dLat = Math.toRadians(lat - this.latitude);
        double dLng = Math.toRadians(lng - this.longitude);

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(this.latitude)) *
                        Math.cos(Math.toRadians(lat)) *
                        Math.sin(dLng/2) * Math.sin(dLng/2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return (float) (R * c);
    }

}