package com.chatify.backend.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String username;

    @Column(unique = true,nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String avatarUrl;

    @Column(name="is_active",nullable = false)
    private boolean active=true;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    @PrePersist
    public void prePersist(){
        if(createdAt==null)
        {
            createdAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate()
    {
        updatedAt = OffsetDateTime.now();
    }
}
