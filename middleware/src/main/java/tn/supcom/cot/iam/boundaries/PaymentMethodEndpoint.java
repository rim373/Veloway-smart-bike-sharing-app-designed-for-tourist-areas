package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.PaymentMethodManager;
import tn.supcom.cot.iam.entities.PaymentMethod;

import java.util.Optional;

@Path("/payment-methods")
public class PaymentMethodEndpoint {
    @EJB
    private PaymentMethodManager paymentMethodManager;

    //-------GET Payment Method by ID-------
    @GET
    @Path("/{paymentMethodId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPaymentMethodById(@PathParam("paymentMethodId") String paymentMethodId) {
        Optional<PaymentMethod> paymentMethod = paymentMethodManager.getPaymentMethodById(paymentMethodId);
        if (paymentMethod.isPresent()) {
            return Response.ok(paymentMethod.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Payment method not found")
                .build();
    }

    //-------GET All Payment Methods-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllPaymentMethods() {
        var ret = new GenericEntity<>(paymentMethodManager.getAllPaymentMethods()) {};
        return Response.ok(ret).build();
    }

    //-------GET Payment Methods by User-------
    @GET
    @Path("/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPaymentMethodsByUserId(@PathParam("userId") String userId) {
        var ret = new GenericEntity<>(paymentMethodManager.getPaymentMethodsByUserId(userId)) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Payment Method-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPaymentMethod(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Payment method data is required")
                    .build();
        }
        PaymentMethod saved = paymentMethodManager.createPaymentMethod(paymentMethod);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------PUT Update Payment Method-------
    @PUT
    @Path("/{paymentMethodId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePaymentMethod(@PathParam("paymentMethodId") String paymentMethodId, PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Payment method data is required")
                    .build();
        }
        paymentMethod.setPaymentMethodId(paymentMethodId);
        PaymentMethod updated = paymentMethodManager.updatePaymentMethod(paymentMethod);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Payment method not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE Payment Method-------
    @DELETE
    @Path("/{paymentMethodId}")
    public Response deletePaymentMethod(@PathParam("paymentMethodId") String paymentMethodId) {
        boolean deleted = paymentMethodManager.deletePaymentMethod(paymentMethodId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Payment method not found")
                    .build();
        }
        return Response.noContent().build();
    }

    //-------GET Check if User has Payment Method-------
    @GET
    @Path("/user/{userId}/has-payment-method")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasPaymentMethod(@PathParam("userId") String userId) {
        boolean hasMethod = paymentMethodManager.hasPaymentMethod(userId);
        return Response.ok()
                .entity("{\"userId\": \"" + userId + "\", \"hasPaymentMethod\": " + hasMethod + "}")
                .build();
    }

    //-------GET Count Payment Methods by User-------
    @GET
    @Path("/user/{userId}/count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response countPaymentMethodsByUser(@PathParam("userId") String userId) {
        long count = paymentMethodManager.countPaymentMethodsByUser(userId);
        return Response.ok()
                .entity("{\"userId\": \"" + userId + "\", \"count\": " + count + "}")
                .build();
    }
}