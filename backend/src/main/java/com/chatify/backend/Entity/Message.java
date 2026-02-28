package com.chatify.backend.Entity;


import com.chatify.backend.Enum.MessageType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Document(collection = "message")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    private String id;

    private String roomId;
    private String senderId;
    private String senderName;
    private String senderAvatarUrl;

    private String senderEmail;
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private boolean isEdited = false;
    private boolean isDeleted= false;

    private OffsetDateTime timestamp;
    private OffsetDateTime editedAt;


}
