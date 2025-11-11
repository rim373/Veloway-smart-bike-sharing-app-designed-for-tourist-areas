package tn.supcom.cot.iam.boundaries;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tn.supcom.cot.iam.security.Argon2Utility;
import tn.supcom.cot.iam.controllers.repositories.IdentityRepository;
import tn.supcom.cot.iam.entities.Identity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationEndpointSignUpTest {

    private AuthenticationEndpoint endpoint;
    private IdentityRepository identityRepo;
    private Argon2Utility argon2Utility;

    @BeforeEach
    void setUp() {
        identityRepo = mock(IdentityRepository.class);
        argon2Utility = mock(Argon2Utility.class);

        endpoint = new AuthenticationEndpoint();
        endpoint.setIdentityRepository(identityRepo);
        endpoint.setArgon2Utility(argon2Utility);
    }

    @Test
    void testSignUpSuccess() {
        when(identityRepo.findByUsername("newuser")).thenReturn(null);
        when(argon2Utility.hash("password123")).thenReturn("hashed-pass");

        Response response = endpoint.signUp("newuser", "password123");

        assertEquals(201, response.getStatus());
        verify(identityRepo).save(any(Identity.class));
    }

    @Test
    void testSignUpUserAlreadyExists() {
        Identity existing = new Identity();
        existing.setUsername("john");

        when(identityRepo.findByUsername("john")).thenReturn(existing);

        Response response = endpoint.signUp("john", "password");
        assertEquals(409, response.getStatus());
    }
}
