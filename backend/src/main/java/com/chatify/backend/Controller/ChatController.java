package com.chatify.backend.Controller;

import com.chatify.backend.DTO.EditMessageRequest;
import com.chatify.backend.Entity.Message;
import com.chatify.backend.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

@RestController
public class ChatController {

    @Autowired
    private MessageService messageService;

    // Handle incoming real-time messages
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId,
                               @Payload Message message) {
        return messageService.saveMessage(message);
    }

    // Handle message edits in real time
    @MessageMapping("/chat/{roomId}/edit")
    @SendTo("/topic/room/{roomId}/edits")
    public Message editMessage(@DestinationVariable String roomId,
                               @Payload EditMessageRequest request) {
        return messageService.editMessage(
                request.getMessageId(),
                request.getRequesterId(),
                request.getNewContent());
    }
    // Fetch message history (REST, not WebSocket)
    @GetMapping("/api/messages/{roomId}")
    @ResponseBody
    public Page<Message> getMessages(@PathVariable String roomId,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "50") int size) {
        return messageService.getMessages(roomId, page, size);
    }
}
