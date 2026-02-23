package com.chatify.backend.DTO;

import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Enum.ChatRoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;

import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomResponse {

    private Long id;
    private String name;
    private String description;
    private ChatRoomType type;
    private String avatarUrl;
    private UserResponse createdBy;
    private List<RoomMemberResponse> members;
    private OffsetDateTime createdAt;

    public static ChatRoomResponse from(ChatRoom room,
                                        List<RoomMember> members) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .avatarUrl(room.getAvatarUrl())
                .createdBy(UserResponse.from(room.getCreatedBy()))
                .members(members.stream()
                        .map(RoomMemberResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(room.getCreatedAt())
                .build();
    }
}