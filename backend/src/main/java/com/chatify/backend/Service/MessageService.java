package com.chatify.backend.Service;

import com.chatify.backend.Entity.Message;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Exception.UnauthorizedException;
import com.chatify.backend.Repository.MessageRepository;
import com.chatify.backend.Repository.RoomMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private RoomMemberRepository roomMemberRepository;

    // Save a new message (called by WebSocket controller)
    public Message saveMessage(Message message)
    {
        boolean isMember = roomMemberRepository.existsByRoomIdAndUserId(Long.parseLong(message.getRoomId()),Long.parseLong(message.getSenderId()));
        if(!isMember)
        {
            throw new ResourceNotFoundException("User is not a member of this room");
        }
        message.setTimestamp(OffsetDateTime.now());
        message.setEdited(false);
        message.setDeleted(false);
        return messageRepository.save(message);
    }

    // Fetch the paginated message history
    public Page<Message> getMessages(String roomId, int page, int size)
    {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return messageRepository.findByRoomIdAndIsDeletedFalse(roomId, pageable);
    }

    // Soft delete a message
    public Message deleteMessage(String messageId, String requesterId) {
        Message message = messageRepository.findById(Long.parseLong(messageId))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getSenderId().equals(requesterId)) {
            throw new UnauthorizedException("You can only delete your own messages");
        }
        message.setDeleted(true);
        return messageRepository.save(message);
    }

    // Edit a message
    public Message editMessage(String messageId, String requesterId,
                               String newContent) {
        Message message = messageRepository.findById(Long.parseLong(messageId))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getSenderId().equals(requesterId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }
        message.setContent(newContent);
        message.setEdited(true);
        message.setEditedAt(OffsetDateTime.now());
        return messageRepository.save(message);
    }
}
