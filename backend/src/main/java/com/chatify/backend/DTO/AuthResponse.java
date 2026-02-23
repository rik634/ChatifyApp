package com.chatify.backend.DTO;

import com.chatify.backend.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;           // JWT token the client stores
    private String tokenType;       // Always "Bearer"
    private UserResponse user;      // User info so frontend doesn't need a second call

    public static AuthResponse of(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserResponse.from(user))
                .build();
    }
}