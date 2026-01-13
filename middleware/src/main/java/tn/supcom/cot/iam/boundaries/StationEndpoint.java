package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.StationManager;
import tn.supcom.cot.iam.entities.Station;

import java.util.HashSet;
import java.util.Set;

@Path("/stations")
public class StationEndpoint {
    @EJB
    private StationManager stationManager;

    //-------GET Station by ID-------
    @GET
    @Path("/{stationId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStationById(@PathParam("stationId") String stationId) {
        var ret = new GenericEntity<>(stationManager.getStationByStationId(stationId)) {};
        return Response.ok(ret).build();
    }

    //-------GET All Stations-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllStations() {
        var ret = new GenericEntity<>(stationManager.getAllStations()) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Station-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createStation(Station station) {
        if (station == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Station data is required")
                    .build();
        }
        Station saved = stationManager.createStation(station);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update Station-------
    @PUT
    @Path("/{stationId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateStation(@PathParam("stationId") String stationId, Station station) {
        if (station == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Station data is required")
                    .build();
        }
        station.setStationId(stationId);
        Station updated = stationManager.updateStation(station);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Station not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------PUT Update Available Bikes Count-------
    @PUT
    @Path("/{stationId}/available-bikes")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateAvailableBikes(@PathParam("stationId") String stationId) {
        Station updated = stationManager.updateAvailableBikes(null, stationId);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Station not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------GET Check if Station has Available Bikes-------
    @GET
    @Path("/{stationId}/has-available-bikes")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasAvailableBikes(@PathParam("stationId") String stationId) {
        boolean hasAvailable = stationManager.hasAvailableBikes(stationId);
        return Response.ok()
                .entity("{\"stationId\": \"" + stationId + "\", \"hasAvailableBikes\": " + hasAvailable + "}")
                .build();
    }




}
