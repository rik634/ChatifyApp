package com.chatify.backend.Exception;

// Used when: email already registered, username taken,
// user already a member of room, DM already exists
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}