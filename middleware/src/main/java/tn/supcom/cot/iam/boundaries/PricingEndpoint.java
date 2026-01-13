package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.PricingManager;
import tn.supcom.cot.iam.entities.Pricing;

import java.util.Optional;

@Path("/pricings")
public class PricingEndpoint {
    @EJB
    private PricingManager pricingManager;

    //-------GET Pricing by ID-------
    @GET
    @Path("/{pricingId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPricingById(@PathParam("pricingId") String pricingId) {
        Optional<Pricing> pricing = pricingManager.getPricingById(pricingId);
        if (pricing.isPresent()) {
            return Response.ok(pricing.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Pricing not found")
                .build();
    }

    //-------GET All Pricings-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllPricings() {
        var ret = new GenericEntity<>(pricingManager.getAllPricings()) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Pricing-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPricing(Pricing pricing) {
        if (pricing == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Pricing data is required")
                    .build();
        }
        Pricing saved = pricingManager.createPricing(pricing);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update Pricing-------
    @PUT
    @Path("/{pricingId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePricing(@PathParam("pricingId") String pricingId, Pricing pricing) {
        if (pricing == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Pricing data is required")
                    .build();
        }
        pricing.setPricingId(pricingId);
        Pricing updated = pricingManager.updatePricing(pricing);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Pricing not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE Pricing-------
    @DELETE
    @Path("/{pricingId}")
    public Response deletePricing(@PathParam("pricingId") String pricingId) {
        boolean deleted = pricingManager.deletePricing(pricingId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Pricing not found")
                    .build();
        }
        return Response.noContent().build();
    }

    //-------GET Calculate Cost by Time-------
    @GET
    @Path("/{pricingId}/calculate-time")
    @Produces(MediaType.APPLICATION_JSON)
    public Response calculateCostByTime(
            @PathParam("pricingId") String pricingId,
            @QueryParam("duration") Integer duration) {

        if (duration == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("duration is required")
                    .build();
        }

        Float cost = pricingManager.calculateCostByTime(pricingId, duration);
        return Response.ok()
                .entity("{\"pricingId\": \"" + pricingId + "\", \"duration\": " + duration + ", \"cost\": " + cost + "}")
                .build();
    }

    //-------GET Calculate Cost by Distance-------
    @GET
    @Path("/{pricingId}/calculate-distance")
    @Produces(MediaType.APPLICATION_JSON)
    public Response calculateCostByDistance(
            @PathParam("pricingId") String pricingId,
            @QueryParam("distance") Float distance) {

        if (distance == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("distance is required")
                    .build();
        }

        Float cost = pricingManager.calculateCostByDistance(pricingId, distance);
        return Response.ok()
                .entity("{\"pricingId\": \"" + pricingId + "\", \"distance\": " + distance + ", \"cost\": " + cost + "}")
                .build();
    }

    //-------GET Calculate Total Cost-------
    @GET
    @Path("/{pricingId}/calculate-total")
    @Produces(MediaType.APPLICATION_JSON)
    public Response calculateTotalCost(
            @PathParam("pricingId") String pricingId,
            @QueryParam("duration") Integer duration,
            @QueryParam("distance") Float distance) {

        if (duration == null || distance == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("duration and distance are required")
                    .build();
        }

        Float cost = pricingManager.calculateTotalCost(pricingId, duration, distance);
        return Response.ok()
                .entity("{\"pricingId\": \"" + pricingId + "\", \"duration\": " + duration +
                        ", \"distance\": " + distance + ", \"totalCost\": " + cost + "}")
                .build();
    }
}