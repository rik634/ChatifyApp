package com.chatify.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("messageId")
    private String messageId;

    @NotBlank(message = "New content is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    @JsonProperty("newContent")
    private String newContent;

    @JsonProperty("requesterId")
    private String requesterId;
}