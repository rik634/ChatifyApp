package com.chatify.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditMessageRequest {

    @NotBlank(message = "Message ID is required")
    private String messageId;

    @NotBlank(message = "New content is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String newContent;

    private String requesterId;
}