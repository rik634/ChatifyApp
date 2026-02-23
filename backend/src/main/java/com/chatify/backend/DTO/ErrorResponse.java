package com.chatify.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private int status;             // HTTP status code e.g. 404
    private String error;           // Short error type e.g. "Not Found"
    private String message;         // Human readable e.g. "Room not found with id: 5"
    private String path;            // Which endpoint failed e.g. "/api/rooms/5"
    private OffsetDateTime timestamp;

    public static ErrorResponse of(int status, String error,
                                   String message, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}