package com.chatify.backend.Config;

import com.chatify.backend.Security.JwtUtil;
import com.chatify.backend.Security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig
        implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message,
                                      MessageChannel channel) {

                StompHeaderAccessor accessor = MessageHeaderAccessor
                        .getAccessor(message, StompHeaderAccessor.class);

                // Only check auth on initial CONNECT frame
                // (not on every message after connection is established)
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    // Extract token from STOMP header
                    String authHeader = accessor
                            .getFirstNativeHeader("Authorization");

                    if (authHeader == null
                            || !authHeader.startsWith("Bearer ")) {
                        throw new MessageDeliveryException(
                                "Missing or invalid Authorization header");
                    }

                    String token = authHeader.substring(7);

                    try {
                        // Validate token
                        String username = jwtUtil.extractUsername(token);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        if (!jwtUtil.isTokenValid(token,
                                userDetails.getUsername())) {
                            throw new MessageDeliveryException(
                                    "Invalid or expired token");
                        }

                        // Set authenticated user on the WebSocket session
                        // Now Spring knows who this connection belongs to
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        accessor.setUser(auth);

                    } catch (Exception e) {
                        throw new MessageDeliveryException(
                                "Authentication failed: " + e.getMessage());
                    }
                }

                return message;
            }
        });
    }
}