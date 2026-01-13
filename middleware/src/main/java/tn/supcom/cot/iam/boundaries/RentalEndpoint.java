package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.BikeManager;
import tn.supcom.cot.iam.controllers.managers.RentalManager;
import tn.supcom.cot.iam.controllers.managers.StationManager;
import tn.supcom.cot.iam.entities.Rental;
import tn.supcom.cot.iam.entities.Bike;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import java.util.Comparator;
import java.util.Optional;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.Set;

@Path("/rentals")
public class RentalEndpoint {
    @EJB
    private RentalManager rentalManager;

    @EJB
    private BikeManager bikeManager;

    @EJB
    private StationManager stationManager;

    //-------GET Rental by ID-------
    @GET
    @Path("/{rentalId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRentalById(@PathParam("rentalId") String rentalId) {
        var ret = new GenericEntity<>(rentalManager.getRentalsByRentalId(rentalId)) {};
        return Response.ok(ret).build();
    }

    //-------GET All Rentals-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllRentals() {
        var ret = new GenericEntity<>(rentalManager.getRentalsByRentalId(null)) {};
        return Response.ok(ret).build();
    }

    //-------GET Rentals by User ID-------
    @GET
    @Path("/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRentalsByUserId(@PathParam("userId") String userId) {
        var ret = new GenericEntity<>(rentalManager.getRentalsByUserId(userId)) {};
        return Response.ok(ret).build();
    }

    //-------GET Rentals by Bike ID-------
    @GET
    @Path("/bike/{bikeId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRentalsByBikeId(@PathParam("bikeId") String bikeId) {
        var ret = new GenericEntity<>(rentalManager.getRentalsByBikeId(bikeId)) {};
        return Response.ok(ret).build();
    }

    //-------GET Rentals by Status-------
    @GET
    @Path("/status/{status}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRentalsByStatus(@PathParam("status") String status) {
        var ret = new GenericEntity<>(rentalManager.getRentalByRentalStatus(status)) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Rental-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createRental(Rental rental) {
        if (rental == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Rental data is required")
                    .build();
        }
        Rental saved = rentalManager.createRental(rental);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update Rental-------
    @PUT
    @Path("/{rentalId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateRental(@PathParam("rentalId") String rentalId, Rental rental) {
        if (rental == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Rental data is required")
                    .build();
        }
        rental.setRentalId(rentalId);
        Rental updated = rentalManager.updateRental(rental);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE Rental-------
    @DELETE
    @Path("/{rentalId}")
    public Response deleteRental(@PathParam("rentalId") String rentalId) {
        try {
            rentalManager.deleteRental(rentalId);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
    }

    //-------POST Start Rental-------
    @POST
    @Path("/{rentalId}/start")
    @Produces(MediaType.APPLICATION_JSON)
    public Response startRental(@PathParam("rentalId") String rentalId) {
        Rental rental = rentalManager.startRental(rentalId);
        if (rental == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
        return Response.ok(rental).build();
    }

    //-------POST End Rental-------
    @POST
    @Path("/{rentalId}/end")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response endRental(
            @PathParam("rentalId") String rentalId,
            @QueryParam("distanceTraveled") Float distanceTraveled,
            @QueryParam("endStationId") String endStationId) {

        if (distanceTraveled == null || endStationId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("distanceTraveled and endStationId are required")
                    .build();
        }

        Rental rental = rentalManager.endRental(rentalId, distanceTraveled, endStationId);
        if (rental == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found or already completed")
                    .build();
        }
        return Response.ok(rental).build();
    }

    //-------GET Active Rental by User ID-------
    @GET
    @Path("/user/{userId}/active")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getActiveRentalByUserId(@PathParam("userId") String userId) {
        Optional<Rental> rental = rentalManager.getActiveRentalByUserId(userId);
        if (rental.isPresent()) {
            return Response.ok(rental.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("No active rental found for this user")
                .build();
    }

    //-------GET Check if User has Active Rental-------
    @GET
    @Path("/user/{userId}/has-active")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasActiveRental(@PathParam("userId") String userId) {
        boolean hasActive = rentalManager.hasActiveRental(userId);
        return Response.ok()
                .entity("{\"userId\": \"" + userId + "\", \"hasActiveRental\": " + hasActive + "}")
                .build();
    }

    //-------PUT Add Initial Photo-------
    @PUT
    @Path("/{rentalId}/initial-photo")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addInitialPhoto(
            @PathParam("rentalId") String rentalId,
            @QueryParam("photoUrl") String photoUrl) {

        if (photoUrl == null || photoUrl.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("photoUrl is required")
                    .build();
        }

        Rental rental = rentalManager.addInitialPhoto(rentalId, photoUrl);
        if (rental == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
        return Response.ok(rental).build();
    }

    //-------PUT Add Final Photo-------
    @PUT
    @Path("/{rentalId}/final-photo")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addFinalPhoto(
            @PathParam("rentalId") String rentalId,
            @QueryParam("photoUrl") String photoUrl) {

        if (photoUrl == null || photoUrl.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("photoUrl is required")
                    .build();
        }

        Rental rental = rentalManager.addFinalPhoto(rentalId, photoUrl);
        if (rental == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
        return Response.ok(rental).build();
    }

    //-------POST Upload Initial Photo (File)-------
    @POST
    @Path("/{rentalId}/upload-initial-photo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadInitialPhoto(
            @PathParam("rentalId") String rentalId,
            @FormDataParam("file") InputStream fileInputStream,
            @FormDataParam("file") FormDataContentDisposition fileDetail) {

        if (fileInputStream == null || fileDetail == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("File is required")
                    .build();
        }

        try {

            File tempFile = File.createTempFile("rental-initial-", fileDetail.getFileName());


            try (FileOutputStream out = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }

            // Upload vers Cloudinary via le manager
            Rental rental = rentalManager.addInitialPhotoFile(rentalId, tempFile);

            tempFile.delete();

            if (rental == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Rental not found")
                        .build();
            }

            return Response.ok(rental).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Upload failed: " + e.getMessage())
                    .build();
        }
    }

    //-------POST Upload Final Photo (File)-------
    @POST
    @Path("/{rentalId}/upload-final-photo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadFinalPhoto(
            @PathParam("rentalId") String rentalId,
            @FormDataParam("file") InputStream fileInputStream,
            @FormDataParam("file") FormDataContentDisposition fileDetail) {

        if (fileInputStream == null || fileDetail == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("File is required")
                    .build();
        }

        try {

            File tempFile = File.createTempFile("rental-final-", fileDetail.getFileName());


            try (FileOutputStream out = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }

            // Upload vers Cloudinary via le manager
            Rental rental = rentalManager.addFinalPhotoFile(rentalId, tempFile);


            tempFile.delete();

            if (rental == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Rental not found")
                        .build();
            }

            return Response.ok(rental).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Upload failed: " + e.getMessage())
                    .build();
        }
    }


    @POST
    @Path("/reserve")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reserveBike(
            @QueryParam("userId") String userId,
            @QueryParam("stationId") String stationId) {

        if (userId == null || stationId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"userId and stationId are required\"}")
                    .build();
        }

        try {
            Rental rental = rentalManager.reserveBikeAtStation(userId, stationId);
            return Response.status(Response.Status.CREATED).entity(rental).build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to reserve bike: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    //-------POST Complete Rental (FULL AUTOMATION)-------
    @POST
    @Path("/{rentalId}/complete")
    @Produces(MediaType.APPLICATION_JSON)
    public Response completeRental(
            @PathParam("rentalId") String rentalId,
            @QueryParam("endStationId") String endStationId) {

        if (endStationId == null || endStationId.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"endStationId is required\"}")
                    .build();
        }

        try {
            Rental rental = rentalManager.completeRental(rentalId, endStationId);
            return Response.ok(rental).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to complete rental: " + e.getMessage() + "\"}")
                    .build();
        }
    }

}
