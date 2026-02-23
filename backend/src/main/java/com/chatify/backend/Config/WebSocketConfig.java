package com.chatify.backend.Config;

import com.chatify.backend.Entity.User;
import com.chatify.backend.Repository.RoomMemberRepository;
import com.chatify.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private RoomMemberRepository roomMemberRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        // /topic → broadcast (one to many, e.g. room messages)
        // /queue → private (one to one, e.g. direct notifications)
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
        // /user/queue/notifications → sends to specific user only
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message,
                                      MessageChannel channel) {

                StompHeaderAccessor accessor = MessageHeaderAccessor
                        .getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) return message;

                // Validate room membership on SUBSCRIBE and SEND
                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())
                        || StompCommand.SEND.equals(accessor.getCommand())) {

                    String destination = accessor.getDestination();

                    // Only check room-specific destinations
                    if (destination != null
                            && destination.contains("/room/")) {

                        // Extract roomId from destination
                        // e.g. /topic/room/5 → roomId = "5"
                        String roomId = destination
                                .substring(destination.lastIndexOf("/") + 1);

                        // Get authenticated user from session
                        Principal principal = accessor.getUser();
                        if (principal == null) {
                            throw new MessageDeliveryException(
                                    "Not authenticated");
                        }

                        // Check if user is a member of this room
                        User user = userRepository
                                .findByUsername(principal.getName())
                                .orElseThrow();

                        boolean isMember = roomMemberRepository
                                .existsByRoomIdAndUserId(
                                        Long.parseLong(roomId),
                                        user.getId());

                        if (!isMember) {
                            throw new MessageDeliveryException(
                                    "You are not a member of this room");
                        }
                    }
                }

                return message;
            }
        });
    }
}