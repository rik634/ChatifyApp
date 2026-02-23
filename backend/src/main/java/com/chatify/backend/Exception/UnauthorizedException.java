package com.chatify.backend.Exception;

// Used when: user tries to delete someone else's message,
// non-admin tries to remove a member, etc.
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
