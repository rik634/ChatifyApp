package com.chatify.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Message ID is required")
    private String roomId;

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    @JsonProperty("content")
    private String Content;

    private String senderId;

}