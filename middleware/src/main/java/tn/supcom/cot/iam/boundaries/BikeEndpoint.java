package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.GenericType;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.BikeManager;
import tn.supcom.cot.iam.entities.Bike;

import java.util.HashSet;
import java.util.Set;

import java.util.HashSet;
import java.util.Set;

@Path("/bikes")
public class BikeEndpoint {
    @EJB
    private BikeManager bikeManager;

    //-------GET Bike by ID-------
    @GET
    @Path("/{bikeId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBikeById(@PathParam("bikeId") String bikeId) {
        var ret =  new GenericEntity<>(bikeManager.getBikeByBikeId(bikeId)) {};
        return Response.ok(ret).build();
    }

    //------GET All Bikes---------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllBikes() {
        var ret = new GenericEntity<>(bikeManager.getAllBikes()) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Bike------
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response createBike(Bike bike) {
        if (bike == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Bike data is required")
                    .build();
        }
        Bike saved = bikeManager.createBike(bike);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //--------PUT Update Bike--------
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{bikeId}")
    public Response updateBike(@PathParam("bikeId") String bikeId, Bike bike) {
        if (bike == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Bike not Found ").build();
        }
        bike.setBikeId(bikeId);
        Bike updatedBike = bikeManager.updateBike(bike);
        if (updatedBike == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Bike not Found").build();
        }
        return Response.ok(updatedBike).build();
    }

    //--------DELETE Bike by ID-------
    @DELETE
    @Path("/{bikeId}")
    public Response deleteBike(@PathParam("bikeId") String bikeId) {
        boolean deleted = bikeManager.deleteBike(bikeId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).entity("Bike not Found").build();
        }
        return Response.noContent().build();
    }

    //-------GET Bike by StationID------
    @GET
    @Path("by-station/{stationId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBikesByStationId(@PathParam("stationId")String stationId) {
        var ret = new GenericEntity<>(bikeManager.getBikeByStationId(stationId)){};
        return Response.ok(ret).build();
    }

    //-------GET Count Available Bikes by Station-------
    @GET
    @Path("/available/station/{stationId}/count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response countAvailableBikesByStation(@PathParam("stationId") String stationId) {
        long count = bikeManager.countAvailableBikesByStation(stationId);
        return Response.ok(count).build();
    }

    //-------GET Bikes by Status-------
    @GET
    @Path("/status/{status}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBikesByStatus(@PathParam("status") String status) {
        var ret = new GenericEntity<>(bikeManager.getBikeByStatus(status)) {};
        return Response.ok(ret).build();
    }

    //-------PUT Update Bike Status-------
    @PUT
    @Path("/{bikeId}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateBikeStatus(@PathParam("bikeId") String bikeId, @QueryParam("status") String status) {
        if (status == null || status.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Status is required")
                    .build();
        }

        Bike updatedBike = bikeManager.updateBikeStatus(bikeId, status);
        if (updatedBike == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Bike not found")
                    .build();
        }
        return Response.ok(updatedBike).build();
    }

    //-------GET Check Bike Availability-------
    @GET
    @Path("/{bikeId}/availability")
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkBikeAvailability(@PathParam("bikeId") String bikeId) {
        boolean isAvailable = bikeManager.checkAvailability(bikeId);
        return Response.ok()
                .entity("{\"bikeId\": \"" + bikeId + "\", \"available\": " + isAvailable + "}")
                .build();
    }

    //-------GET Available Bikes by Station-------
    @GET
    @Path("/available/station/{stationId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAvailableBikesByStation(@PathParam("stationId") String stationId) {
        var ret = new GenericEntity<>(bikeManager.getAvailableBikesByStation(stationId)) {};
        return Response.ok(ret).build();
    }
}
