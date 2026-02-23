package com.chatify.backend.DTO;

import com.chatify.backend.Entity.Message;
import com.chatify.backend.Enum.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private String id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String content;
    private MessageType type;
    private Boolean isEdited;
    private OffsetDateTime timestamp;
    private OffsetDateTime editedAt;

    // Note: isDeleted is NOT included — deleted messages
    // are filtered out in the repository query, never sent to frontend

    public static MessageResponse from(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderAvatarUrl(message.getSenderAvatarUrl())
                .content(message.getContent())
                .type(message.getType())
                .isEdited(message.isEdited())
                .timestamp(message.getTimestamp())
                .editedAt(message.getEditedAt())
                .build();
    }
}
