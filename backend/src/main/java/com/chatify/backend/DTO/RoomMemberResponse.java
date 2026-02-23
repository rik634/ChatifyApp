package com.chatify.backend.DTO;

import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Enum.MemberType;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.lang.reflect.Member;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMemberResponse {

    private Long userId;
    private String username;
    private String avatarUrl;
    private MemberType role;
    private OffsetDateTime joinedAt;

    public static RoomMemberResponse from(RoomMember member) {
        return RoomMemberResponse.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .avatarUrl(member.getUser().getAvatarUrl())
                .role(member.getType())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}