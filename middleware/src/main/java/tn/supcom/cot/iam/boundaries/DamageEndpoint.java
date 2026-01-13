package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.DamageManager;
import tn.supcom.cot.iam.entities.Damage;

import java.util.Optional;

@Path("/damages")
public class DamageEndpoint {
    @EJB
    private DamageManager damageManager;

    //-------GET Damage by ID-------
    @GET
    @Path("/{damageId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDamageById(@PathParam("damageId") String damageId) {
        Optional<Damage> damage = damageManager.getDamageById(damageId);
        if (damage.isPresent()) {
            return Response.ok(damage.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Damage not found")
                .build();
    }

    //-------GET All Damages-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllDamages() {
        var ret = new GenericEntity<>(damageManager.getAllDamages()) {};
        return Response.ok(ret).build();
    }

    //-------GET Damages by Bike-------
    @GET
    @Path("/bike/{bikeId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDamagesByBikeId(@PathParam("bikeId") String bikeId) {
        var ret = new GenericEntity<>(damageManager.getDamagesByBikeId(bikeId)) {};
        return Response.ok(ret).build();
    }

    //-------GET Damages by Rental-------
    @GET
    @Path("/rental/{rentalId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDamagesByRentalId(@PathParam("rentalId") String rentalId) {
        var ret = new GenericEntity<>(damageManager.getDamagesByRentalId(rentalId)) {};
        return Response.ok(ret).build();
    }

    //-------GET Damages by Status-------
    @GET
    @Path("/status/{status}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDamagesByStatus(@PathParam("status") String status) {
        var ret = new GenericEntity<>(damageManager.getDamagesByStatus(status)) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Damage-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createDamage(Damage damage) {
        if (damage == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Damage data is required")
                    .build();
        }
        Damage saved = damageManager.createDamage(damage);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update Damage-------
    @PUT
    @Path("/{damageId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateDamage(@PathParam("damageId") String damageId, Damage damage) {
        if (damage == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Damage data is required")
                    .build();
        }
        damage.setDamageId(damageId);
        Damage updated = damageManager.updateDamage(damage);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE Damage-------
    @DELETE
    @Path("/{damageId}")
    public Response deleteDamage(@PathParam("damageId") String damageId) {
        boolean deleted = damageManager.deleteDamage(damageId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.noContent().build();
    }

    //-------PUT Confirm Damage-------
    @PUT
    @Path("/{damageId}/confirm")
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirmDamage(@PathParam("damageId") String damageId) {
        Damage damage = damageManager.confirmDamage(damageId);
        if (damage == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.ok(damage).build();
    }

    //-------PUT Mark as Repaired-------
    @PUT
    @Path("/{damageId}/repaired")
    @Produces(MediaType.APPLICATION_JSON)
    public Response markAsRepaired(@PathParam("damageId") String damageId) {
        Damage damage = damageManager.markAsRepaired(damageId);
        if (damage == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.ok(damage).build();
    }

    //-------PUT Add Before Photo-------
    @PUT
    @Path("/{damageId}/before-photo")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addBeforePhoto(
            @PathParam("damageId") String damageId,
            @QueryParam("photoUrl") String photoUrl) {

        if (photoUrl == null || photoUrl.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("photoUrl is required")
                    .build();
        }

        Damage damage = damageManager.addBeforePhoto(damageId, photoUrl);
        if (damage == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.ok(damage).build();
    }

    //-------PUT Add After Photo-------
    @PUT
    @Path("/{damageId}/after-photo")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addAfterPhoto(
            @PathParam("damageId") String damageId,
            @QueryParam("photoUrl") String photoUrl) {

        if (photoUrl == null || photoUrl.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("photoUrl is required")
                    .build();
        }

        Damage damage = damageManager.addAfterPhoto(damageId, photoUrl);
        if (damage == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Damage not found")
                    .build();
        }
        return Response.ok(damage).build();
    }

    //-------GET Total Repair Cost by Bike-------
    @GET
    @Path("/bike/{bikeId}/total-repair-cost")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTotalRepairCostByBike(@PathParam("bikeId") String bikeId) {
        Float total = damageManager.getTotalRepairCostByBike(bikeId);
        return Response.ok()
                .entity("{\"bikeId\": \"" + bikeId + "\", \"totalRepairCost\": " + total + "}")
                .build();
    }

    //-------GET Count Unrepaired Damages by Bike-------
    @GET
    @Path("/bike/{bikeId}/unrepaired-count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response countUnrepairedDamagesByBike(@PathParam("bikeId") String bikeId) {
        long count = damageManager.countUnrepairedDamagesByBike(bikeId);
        return Response.ok()
                .entity("{\"bikeId\": \"" + bikeId + "\", \"unrepairedCount\": " + count + "}")
                .build();
    }
}