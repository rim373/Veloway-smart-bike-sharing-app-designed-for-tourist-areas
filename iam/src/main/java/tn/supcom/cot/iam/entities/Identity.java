package tn.supcom.cot.iam.entities;

import jakarta.nosql.Column;
import jakarta.nosql.Entity;
import jakarta.nosql.Id;

import java.security.Principal;
import java.time.Instant;
import java.util.Set;

@Entity
public class Identity implements RootEntity<String>, Principal {

    @Id
    private String id;

    @Column
    private long version = 0L;

    @Column
    private String username;  // utilisé pour login/email

    @Column
    private String email;     // PWA utilise email obligatoire

    @Column
    private String password;  // hashé avec Argon2

    @Column
    private boolean active = false; // activation compte

    @Column
    private Set<String> roles; // ex: ["USER"], ["ADMIN"]

    @Column
    private String providedScopes = "default";

    @Column
    private String fullName; // optionnel, utile PWA

    @Column
    private Instant createdAt = Instant.now();

    @Column
    private Instant updatedAt = Instant.now();

    // -------- ID & VERSION ---------

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public long getVersion() {
        return version;
    }

    @Override
    public void setVersion(long version) {
        if (this.version != version) {
            throw new IllegalStateException();
        }
        ++this.version;
    }

    // -------- PRINCIPAL ---------

    @Override
    public String getName() {
        return username;
    }

    // -------- GETTERS / SETTERS --------

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
        this.updatedAt = Instant.now();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        this.updatedAt = Instant.now();
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
        this.updatedAt = Instant.now();
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
        this.updatedAt = Instant.now();
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
        this.updatedAt = Instant.now();
    }

    public String getProvidedScopes() {
        return providedScopes;
    }

    public void setProvidedScopes(String providedScopes) {
        this.providedScopes = providedScopes;
        this.updatedAt = Instant.now();
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
