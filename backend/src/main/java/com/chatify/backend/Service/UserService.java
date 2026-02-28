package com.chatify.backend.Service;

import com.chatify.backend.DTO.AuthResponse;
import com.chatify.backend.DTO.LoginRequest;
import com.chatify.backend.DTO.RegisterRequest;
import com.chatify.backend.DTO.UserResponse;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Exception.ConflictException;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Repository.UserRepository;
import com.chatify.backend.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        // Create user — hash password before saving
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()) // NEVER store plain text
        );
        user.setActive(true);
        User saved = userRepository.save(user);

        // Generate JWT and return response
        String token = jwtUtil.generateToken(saved.getEmail());
        return AuthResponse.of(token, saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        // Spring Security validates credentials against database
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, credentials are valid
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.of(token, user);
    }
}
