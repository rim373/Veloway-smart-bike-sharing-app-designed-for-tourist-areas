package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.GPSPointManager;
import tn.supcom.cot.iam.entities.GPSPoint;

import java.util.Optional;

@Path("/gps-points")
public class GPSPointEndpoint {
    @EJB
    private GPSPointManager gpsPointManager;

    //-------GET GPS Point by ID-------
    @GET
    @Path("/{gpsPointId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGPSPointById(@PathParam("gpsPointId") String gpsPointId) {
        Optional<GPSPoint> gpsPoint = gpsPointManager.getGPSPointById(gpsPointId);
        if (gpsPoint.isPresent()) {
            return Response.ok(gpsPoint.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("GPS Point not found")
                .build();
    }

    //-------GET All GPS Points-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllGPSPoints() {
        var ret = new GenericEntity<>(gpsPointManager.getAllGPSPoints()) {};
        return Response.ok(ret).build();
    }

    //-------POST Create GPS Point-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createGPSPoint(GPSPoint gpsPoint) {
        if (gpsPoint == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("GPS Point data is required")
                    .build();
        }
        GPSPoint saved = gpsPointManager.createGPSPoint(gpsPoint);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------POST Create GPS Point with Coordinates-------
    @POST
    @Path("/create-with-coordinates")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createGPSPointWithCoordinates(
            @QueryParam("latitude") Float latitude,
            @QueryParam("longitude") Float longitude) {

        if (latitude == null || longitude == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("latitude and longitude are required")
                    .build();
        }

        GPSPoint saved = gpsPointManager.createGPSPointWithCoordinates(latitude, longitude);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update GPS Point-------
    @PUT
    @Path("/{gpsPointId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateGPSPoint(@PathParam("gpsPointId") String gpsPointId, GPSPoint gpsPoint) {
        if (gpsPoint == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("GPS Point data is required")
                    .build();
        }
        gpsPoint.setGpsPointId(gpsPointId);
        GPSPoint updated = gpsPointManager.updateGPSPoint(gpsPoint);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("GPS Point not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE GPS Point-------
    @DELETE
    @Path("/{gpsPointId}")
    public Response deleteGPSPoint(@PathParam("gpsPointId") String gpsPointId) {
        boolean deleted = gpsPointManager.deleteGPSPoint(gpsPointId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("GPS Point not found")
                    .build();
        }
        return Response.noContent().build();
    }

    //-------GET Calculate Distance between two GPS Points-------
    @GET
    @Path("/distance")
    @Produces(MediaType.APPLICATION_JSON)
    public Response calculateDistance(
            @QueryParam("point1") String gpsPointId1,
            @QueryParam("point2") String gpsPointId2) {

        if (gpsPointId1 == null || gpsPointId2 == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Both point1 and point2 are required")
                    .build();
        }

        Float distance = gpsPointManager.calculateDistance(gpsPointId1, gpsPointId2);
        return Response.ok()
                .entity("{\"point1\": \"" + gpsPointId1 + "\", \"point2\": \"" + gpsPointId2 +
                        "\", \"distanceKm\": " + distance + "}")
                .build();
    }
}