package com.chatify.backend.DTO;

import com.chatify.backend.Enum.ChatRoomType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    // Required for GROUP and CHANNEL, null for DM
    @Size(min = 3, max = 100, message = "Room name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Room type is required")
    private ChatRoomType type;     // DM, GROUP, CHANNEL

    // Only used for DM creation — the other participant's ID
    private Long targetUserId;
}