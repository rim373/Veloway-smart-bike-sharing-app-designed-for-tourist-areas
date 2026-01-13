package tn.supcom.cot.iam.controllers.managers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import tn.supcom.cot.iam.controllers.repositories.GrantRepository;
import tn.supcom.cot.iam.controllers.repositories.IdentityRepository;
import tn.supcom.cot.iam.controllers.repositories.TenantRepository;
import tn.supcom.cot.iam.entities.Grant;
import tn.supcom.cot.iam.entities.GrantPK;
import tn.supcom.cot.iam.entities.Identity;
import tn.supcom.cot.iam.entities.Tenant;

import java.util.Optional;
import java.util.Set;

@ApplicationScoped
public class PhoenixIAMManager {

    @Inject
    private IdentityRepository identityRepository;

    @Inject
    private TenantRepository tenantRepository;

    @Inject
    private GrantRepository grantRepository;

    // =========================
    // TENANT
    // =========================
    public Tenant findTenantByName(String name) {
        return tenantRepository.findByName(name).orElse(null);
    }

    // =========================
    // IDENTITY
    // =========================
    public Identity findIdentityByUsername(String username) {
        return identityRepository.findByUsername(username).orElse(null);
    }

    public Identity findIdentityByEmail(String email) {
        return identityRepository.findByEmail(email).orElse(null);
    }

    public void saveIdentity(Identity identity) {
        identityRepository.save(identity);     }

    // =========================
    // GRANT
    // =========================
    public Optional<Grant> findGrant(String tenantName, String identityId) {
        Tenant tenant = findTenantByName(tenantName);
        if (tenant == null) {
            return Optional.empty();
        }

        GrantPK pk = new GrantPK();
        pk.setIdentityId(identityId);
        pk.setTenantId(tenant.getId());

        return grantRepository.findById(pk);
    }

    // =========================
    // ROLES
    // =========================
    public String[] getRoles(String username) {
        Identity identity = identityRepository.findByUsername(username).orElse(null);

        if (identity == null || identity.getRoles() == null) {
            return new String[0];
        }

        return identity.getRoles().toArray(new String[0]);
    }
}
