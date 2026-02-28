package com.chatify.backend.Controller;


import com.chatify.backend.DTO.UserResponse;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.chatify.backend.Repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers()
    {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get current logged-in user's profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(UserResponse.from(user));
    }

    // Search users by username (for starting a DM)
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Exclude current user from results
        return ResponseEntity.ok(
                userRepository.searchByUsername(username,
                                userDetails.getUsername())
                        .stream()
                        .map(UserResponse::from)
                        .collect(Collectors.toList())
        );
    }

    // Get any user's public profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id));
        return ResponseEntity.ok(UserResponse.from(user));
    }
}