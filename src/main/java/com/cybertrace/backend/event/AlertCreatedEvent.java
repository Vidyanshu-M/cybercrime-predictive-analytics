package com.cybertrace.backend.event;

import com.cybertrace.backend.dto.AlertDto.AlertResponse;

public record AlertCreatedEvent(AlertResponse alert) {}
