package tn.supcom.cot.iam.boundaries;

import jakarta.ejb.EJB;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import tn.supcom.cot.iam.controllers.managers.PaymentManager;
import tn.supcom.cot.iam.entities.Payment;

import java.util.Optional;

@Path("/payments")
public class PaymentEndpoint {
    @EJB
    private PaymentManager paymentManager;

    //-------GET Payment by ID-------
    @GET
    @Path("/{paymentId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPaymentById(@PathParam("paymentId") String paymentId) {
        Optional<Payment> payment = paymentManager.getPaymentById(paymentId);
        if (payment.isPresent()) {
            return Response.ok(payment.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Payment not found")
                .build();
    }

    //-------GET All Payments-------
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllPayments() {
        var ret = new GenericEntity<>(paymentManager.getAllPayments()) {};
        return Response.ok(ret).build();
    }

    //-------GET Payments by Payment Method-------
    @GET
    @Path("/payment-method/{paymentMethodId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPaymentsByPaymentMethodId(@PathParam("paymentMethodId") String paymentMethodId) {
        var ret = new GenericEntity<>(paymentManager.getPaymentsByPaymentMethodId(paymentMethodId)) {};
        return Response.ok(ret).build();
    }

    //-------POST Create Payment-------
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPayment(Payment payment) {
        if (payment == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Payment data is required")
                    .build();
        }
        Payment saved = paymentManager.createPayment(payment);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    //-------POST Create Payment for Rental-------
    @POST
    @Path("/rental/{rentalId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPaymentForRental(
            @PathParam("rentalId") String rentalId,
            @QueryParam("amount") Float amount,
            @QueryParam("paymentMethodId") String paymentMethodId,
            @QueryParam("pricingId") String pricingId) {

        if (amount == null || paymentMethodId == null || pricingId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("amount, paymentMethodId and pricingId are required")
                    .build();
        }

        Payment payment = paymentManager.createPaymentForRental(rentalId, amount, paymentMethodId, pricingId);
        if (payment == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Rental not found")
                    .build();
        }
        return Response.status(Response.Status.CREATED).entity(payment).build();
    }

    //-------PUT Update Payment-------
    @PUT
    @Path("/{paymentId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePayment(@PathParam("paymentId") String paymentId, Payment payment) {
        if (payment == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Payment data is required")
                    .build();
        }
        payment.setPaymentId(paymentId);
        Payment updated = paymentManager.updatePayment(payment);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Payment not found")
                    .build();
        }
        return Response.ok(updated).build();
    }

    //-------DELETE Payment-------
    @DELETE
    @Path("/{paymentId}")
    public Response deletePayment(@PathParam("paymentId") String paymentId) {
        boolean deleted = paymentManager.deletePayment(paymentId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Payment not found")
                    .build();
        }
        return Response.noContent().build();
    }

    //-------GET Total Amount by Payment Method-------
    @GET
    @Path("/payment-method/{paymentMethodId}/total")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTotalAmountByPaymentMethod(@PathParam("paymentMethodId") String paymentMethodId) {
        Float total = paymentManager.getTotalAmountByPaymentMethod(paymentMethodId);
        return Response.ok()
                .entity("{\"paymentMethodId\": \"" + paymentMethodId + "\", \"totalAmount\": " + total + "}")
                .build();
    }
}