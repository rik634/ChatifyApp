package com.chatify.backend.Exception;

// Used when: room not found, user not found, message not found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}