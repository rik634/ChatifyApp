package com.chatify.backend.Entity;


import com.chatify.backend.Enum.ChatRoomType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Table(name = "chat_room")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // null for DM, required for GROUP/CHANNEL

    private String description; //bio

    @Enumerated(EnumType.STRING)
    private ChatRoomType type;

    private String avatarUrl;

    @Column(name="is_active",nullable = false)
    private boolean active=true;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist()
    {
        createdAt = OffsetDateTime.now();
    }

    @PreUpdate
    public  void preUpdate()
    {
        updatedAt = OffsetDateTime.now();
    }
}

