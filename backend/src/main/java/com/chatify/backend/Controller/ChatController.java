package com.chatify.backend.Controller;

import com.chatify.backend.DTO.ChatMessageRequest;
import com.chatify.backend.DTO.EditMessageRequest;
import com.chatify.backend.Entity.Message;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Repository.MessageRepository;
import com.chatify.backend.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;


    // Handle incoming real-time messages
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public void sendMessage(@DestinationVariable String roomId,
                               @Payload ChatMessageRequest message,
                               Principal principal) {
        Message saved = messageService.saveMessage(roomId,principal.getName(),message);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);
    }

    // Handle message edits in real time
    @MessageMapping("/chat/{roomId}/edit")
    public void editMessage(@DestinationVariable String roomId, // FIX 1: Added roomId variable
                            @Payload EditMessageRequest request,
                            Principal principal) {

        String currentUserEmail = principal.getName();

        // FIX 2: Capture the return value in a variable called 'edited'
        Message edited = messageService.editMessage(
                request.getMessageId(),
                currentUserEmail,
                request.getNewContent()
        );

        // FIX 3: Now 'roomId' and 'edited' are valid and will broadcast correctly
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/edit", edited);

        System.out.println("📢 Broadcasted edit for message: " + edited.getId());
    }
    // Fetch message history (REST, not WebSocket)
    @GetMapping("/api/messages/{roomId}")
    @ResponseBody
    public Page<Message> getMessages(@PathVariable String roomId,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "50") int size) {
        return messageService.getMessages(roomId, page, size);
    }
    // Handle Deleting a Message (Soft Delete)
    @MessageMapping("/chat/{roomId}/delete")
    public void deleteMessage(@DestinationVariable String roomId, @Payload String messageId, Principal principal) {
        // principal.getName() usually returns the username/email of the logged-in user
        messageService.deleteMessage(messageId, principal.getName());

        // Broadcast the deletion to the room so the UI removes it for everyone
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/delete", messageId);
    }

    @GetMapping("/api/rooms/{roomId}/members")
    public ResponseEntity<List<User>> getRoomMembers(@PathVariable String roomId) {
        List<User> members = messageService.getRoomMembers(roomId);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/api/rooms/{roomId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable String roomId,
                                          @PathVariable String userId,
                                          Principal principal) {
        messageService.removeMember(roomId, userId, principal.getName());
        return ResponseEntity.ok().build();
    }
}
