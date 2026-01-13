package tn.supcom.cot.iam.boundaries;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.HashSet;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.logging.Logger;

import tn.supcom.cot.iam.controllers.managers.PhoenixIAMManager;
import tn.supcom.cot.iam.entities.Identity;
import tn.supcom.cot.iam.security.Argon2Utility;
import tn.supcom.cot.iam.security.AuthorizationCode;
import tn.supcom.cot.iam.security.JwtManager;

@Path("/auth")
@RequestScoped
public class AuthenticationEndpoint {

    public static final String CHALLENGE_RESPONSE_COOKIE_ID = "signInId";

    @Inject
    private Logger logger;

    @Inject
    PhoenixIAMManager phoenixIAMRepository;

    @Inject
    JwtManager jwtManager;

    // ===============================
    // 1. PING
    // ===============================
    @GET
    @Path("/ping")
    @Produces(MediaType.TEXT_PLAIN)
    public String ping() {
        return "PONG: La classe est bien chargee sur /auth";
    }

    // ===============================
    // 2. TEST ARGON2
    // ===============================
    @GET
    @Path("/argon2-test")
    @Produces(MediaType.TEXT_PLAIN)
    public String testArgon2() {
        String hash = Argon2Utility.hash("test123".toCharArray());
        boolean ok = Argon2Utility.check(hash, "test123".toCharArray());
        return "HASH OK = " + ok;
    }

    // ===============================
    // 3. LOGIN JSON (PWA)
    // ===============================
    public static class LoginRequest {
        public String email;
        public String password;
        public LoginRequest() {}
    }

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response apiLogin(LoginRequest request) {
        if (request == null || request.email == null || request.password == null) {
            return Response.status(400).entity(Map.of("error", "email and password required")).build();
        }

        Identity identity = phoenixIAMRepository.findIdentityByEmail(request.email);
        if (identity == null) {
            return Response.status(401).entity(Map.of("error", "User not found")).build();
        }

        if (!identity.isActive()) {
            return Response.status(403).entity(Map.of("error", "Account not activated")).build();
        }

        if (!Argon2Utility.check(identity.getPassword(), request.password.toCharArray())) {
            return Response.status(401).entity(Map.of("error", "Invalid password")).build();
        }

        String[] roles = phoenixIAMRepository.getRoles(identity.getUsername());
        if (roles == null) roles = new String[]{"USER"};

        String token = jwtManager.generateToken(
                "veloway-realm",
                identity.getUsername(),
                "api",
                roles
        );

        return Response.ok(Map.of(
                "token", token,
                "username", identity.getUsername()
        )).build();
    }

    // ===============================
    // 4. REGISTER JSON (NOUVEAU)
    // ===============================
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public RegisterRequest() {}
    }

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response register(RegisterRequest request) {
        if (request == null || request.username == null || request.email == null || request.password == null) {
            return Response.status(400)
                    .entity(Map.of("error", "username, email and password are required"))
                    .build();
        }

        Identity existingUser = phoenixIAMRepository.findIdentityByUsername(request.username);
        if (existingUser != null) {
            return Response.status(409)
                    .entity(Map.of("error", "Username already exists"))
                    .build();
        }

        existingUser = phoenixIAMRepository.findIdentityByEmail(request.email);
        if (existingUser != null) {
            return Response.status(409)
                    .entity(Map.of("error", "Email already exists"))
                    .build();
        }

        Identity identity = new Identity();
        identity.setUsername(request.username);
        identity.setEmail(request.email);
        identity.setPassword(Argon2Utility.hash(request.password.toCharArray()));
        identity.setActive(true);

        // CHANGEZ ICI - utilisez HashSet au lieu de Set.of()
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        identity.setRoles(roles);

        phoenixIAMRepository.saveIdentity(identity);

        return Response.status(201)
                .entity(Map.of(
                        "message", "User registered successfully",
                        "username", identity.getUsername(),
                        "email", identity.getEmail()
                ))
                .build();
    }

    // ===============================
    // 5. CODE ORIGINAL DU PROF (OAuth2)
    // ===============================
    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/authorize")
    public Response authorize(@Context UriInfo uriInfo) {
        var params = uriInfo.getQueryParameters();
        var clientId = params.getFirst("client_id");
        if (clientId == null || clientId.isEmpty()) {
            return informUserAboutError("Invalid client_id :" + clientId);
        }
        var tenant = phoenixIAMRepository.findTenantByName(clientId);
        if (tenant == null) {
            return informUserAboutError("Invalid client_id :" + clientId);
        }
        if (tenant.getSupportedGrantTypes() != null && !tenant.getSupportedGrantTypes().contains("authorization_code")) {
            return informUserAboutError("Authorization Grant type, authorization_code, is not allowed for this tenant :" + clientId);
        }
        String redirectUri = params.getFirst("redirect_uri");
        if (tenant.getRedirectUri() != null && !tenant.getRedirectUri().isEmpty()) {
            if (redirectUri != null && !redirectUri.isEmpty() && !tenant.getRedirectUri().equals(redirectUri)) {
                return informUserAboutError("redirect_uri is pre-registered and should match");
            }
            redirectUri = tenant.getRedirectUri();
        } else {
            if (redirectUri == null || redirectUri.isEmpty()) {
                return informUserAboutError("redirect_uri is not pre-registered and should be provided");
            }
        }
        String responseType = params.getFirst("response_type");
        if (!"code".equals(responseType) && !"token".equals(responseType)) {
            return informUserAboutError("invalid_grant: " + responseType + ", response_type should be code or token");
        }
        String requestedScope = params.getFirst("scope");
        if (requestedScope == null || requestedScope.isEmpty()) {
            requestedScope = tenant.getRequiredScopes();
        }
        String codeChallengeMethod = params.getFirst("code_challenge_method");
        if(codeChallengeMethod==null || !codeChallengeMethod.equals("S256")){
            return informUserAboutError("invalid_grant: " + codeChallengeMethod + ", code_challenge_method must be 'S256'");
        }
        StreamingOutput stream = output -> {
            try (InputStream is = Objects.requireNonNull(getClass().getResource("/login.html")).openStream()){
                output.write(is.readAllBytes());
            }
        };
        return Response.ok(stream)
                .location(uriInfo.getBaseUri().resolve("/login/authorization"))
                .cookie(new NewCookie.Builder(CHALLENGE_RESPONSE_COOKIE_ID)
                        .httpOnly(true)
                        .secure(true)
                        .sameSite(NewCookie.SameSite.STRICT)
                        .value(tenant.getName()+"#"+requestedScope+"$"+redirectUri)
                        .build())
                .build();
    }

    // ===============================
    // 6. Helpers OAuth
    // ===============================
    private String buildActualRedirectURI(String redirectUri,String responseType,String clientId,String userId,String approvedScopes,String codeChallenge,String state) throws Exception {
        var sb = new StringBuilder(redirectUri);
        if ("code".equals(responseType)) {
            var authorizationCode = new AuthorizationCode(clientId,userId,
                    approvedScopes, Instant.now().plus(2, ChronoUnit.MINUTES).getEpochSecond(),redirectUri);
            sb.append("?code=").append(URLEncoder.encode(authorizationCode.getCode(codeChallenge), StandardCharsets.UTF_8));
        } else {
            return null;
        }
        if (state != null) {
            sb.append("&state=").append(state);
        }
        return sb.toString();
    }

    private String checkUserScopes(String userScopes, String requestedScope) {
        Set<String> allowedScopes = new LinkedHashSet<>();
        Set<String> rScopes = new HashSet<>(Arrays.asList(requestedScope.split(" ")));
        Set<String> uScopes = new HashSet<>(Arrays.asList(userScopes.split(" ")));
        for (String scope : uScopes) {
            if (rScopes.contains(scope)) allowedScopes.add(scope);
        }
        return String.join( " ", allowedScopes);
    }

    private Response informUserAboutError(String error) {
        return Response.status(Response.Status.BAD_REQUEST).entity("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Error</title>
                </head>
                <body>
                <aside class="container">
                    <p>%s</p>
                </aside>
                </body>
                </html>
                """.formatted(error)).build();
    }
}
