package tn.supcom.cot.iam.boundaries;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import tn.supcom.cot.iam.security.JwtManager;
import tn.supcom.cot.iam.security.Argon2Utility;
import tn.supcom.cot.iam.controllers.repositories.IdentityRepository;
import tn.supcom.cot.iam.entities.Identity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationEndpointTest {

    private AuthenticationEndpoint endpoint;
    private JwtManager jwtManager;
    private Argon2Utility argon2Utility;
    private IdentityRepository identityRepo;

    @BeforeEach
    void setUp() {
        jwtManager = mock(JwtManager.class);
        argon2Utility = mock(Argon2Utility.class);
        identityRepo = mock(IdentityRepository.class);

        endpoint = new AuthenticationEndpoint();
        endpoint.setJwtManager(jwtManager);
        endpoint.setArgon2Utility(argon2Utility);
        endpoint.setIdentityRepository(identityRepo);
    }

    @Test
    void testLoginSuccess() {
        Identity mockUser = new Identity();
        mockUser.setUsername("john");
        mockUser.setPassword("hashed-pass");

        when(identityRepo.findByUsername("john")).thenReturn(mockUser);
        when(argon2Utility.verify("hashed-pass", "password123")).thenReturn(true);
        when(jwtManager.generateToken("john")).thenReturn("fake-jwt-token");

        Response response = endpoint.login("john", "password123");

        assertEquals(200, response.getStatus());
        String body = response.getEntity().toString();
        assertTrue(body.contains("fake-jwt-token"));
    }

    @Test
    void testLoginFailureWrongPassword() {
        Identity mockUser = new Identity();
        mockUser.setUsername("john");
        mockUser.setPassword("hashed-pass");

        when(identityRepo.findByUsername("john")).thenReturn(mockUser);
        when(argon2Utility.verify("hashed-pass", "wrongpass")).thenReturn(false);

        Response response = endpoint.login("john", "wrongpass");
        assertEquals(401, response.getStatus());
    }

    @Test
    void testLoginUserNotFound() {
        when(identityRepo.findByUsername("unknown")).thenReturn(null);

        Response response = endpoint.login("unknown", "password");
        assertEquals(404, response.getStatus());
    }
}
