package com.cybertrace.backend.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AlertEventListener {

    private static final Logger log = LoggerFactory.getLogger(AlertEventListener.class);
    private final SimpMessagingTemplate messagingTemplate;

    public AlertEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Async
    @EventListener
    public void handleAlertCreated(AlertCreatedEvent event) {
        try {
            log.info("AlertEventListener received event: Broadcasting alert ID [{}] via WebSocket to /topic/alerts",
                    event.alert().id());
            messagingTemplate.convertAndSend("/topic/alerts", event.alert());
        } catch (Exception ex) {
            log.error("Failed to broadcast alert via WebSocket in AlertEventListener: {}", ex.getMessage());
        }
    }
}
