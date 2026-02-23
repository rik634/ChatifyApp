package com.chatify.backend.DTO;

import lombok.Data;

@Data
public class UserDetails {

    private String username;
    private String email;
    private String password;
    private String avatarUrl;

}
