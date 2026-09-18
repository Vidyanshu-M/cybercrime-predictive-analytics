package com.cybertrace.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDto {

    public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        String password
    ) {}

    public record LoginResponse(
        String token,
        String tokenType,
        UUID userId,
        String name,
        String email,
        String role
    ) {}
}
