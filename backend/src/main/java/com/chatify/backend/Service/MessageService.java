package com.chatify.backend.Service;

import com.chatify.backend.DTO.ChatMessageRequest;
import com.chatify.backend.DTO.EditMessageRequest;
import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Entity.Message;
import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Enum.MessageType;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Exception.UnauthorizedException;
import com.chatify.backend.Repository.ChatRoomRepository;
import com.chatify.backend.Repository.MessageRepository;
import com.chatify.backend.Repository.RoomMemberRepository;
import com.chatify.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.chatify.backend.Entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private RoomMemberRepository roomMemberRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Save a new message (called by WebSocket controller)
    @Transactional
    public Message saveMessage(String roomId, String username,ChatMessageRequest request) {

        User user = userRepository.findByEmail(username).orElseThrow(()->new ResourceNotFoundException("User not Found"));
        // 1. Validate Membership
        boolean isMember = roomMemberRepository.existsByRoomIdAndUserId(
                roomId,
                user.getId());

        if (!isMember) {
            throw new UnauthorizedException("User is not a member of this room");
        }

        // 2. Map DTO to Entity
        Message message = new Message();
        message.setContent(request.getContent()); // Using the content from DTO
        message.setRoomId(request.getRoomId());
        message.setSenderId(String.valueOf(user.getId()));
        message.setSenderName(user.getUsername());
        message.setSenderEmail(user.getEmail());
        // 3. Set metadata
        message.setTimestamp(OffsetDateTime.now());
        message.setEdited(false);
        message.setDeleted(false);

        // 4. Save the ENTITY, not the DTO
        return messageRepository.save(message);
    }

    // Fetch the paginated message history
    public Page<Message> getMessages(String roomId, int page, int size)
    {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return messageRepository.findByRoomIdAndIsDeletedFalse(roomId, pageable);
    }

    @Transactional
    public void deleteMessage(String messageId, String requesterEmail) {
        // 1. Find the message in MongoDB
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        // 2. Security Check: Compare the requester's identity with the sender's identity
        // If you store sender email in 'senderId', use that; otherwise, fetch the user ID.
        if (!message.getSenderEmail().equals(requesterEmail)) {
            throw new UnauthorizedException("You can only delete your own messages");
        }

        // 3. Perform Soft Delete
        message.setDeleted(true);

        // 4. Save the update to MongoDB
        messageRepository.save(message);
    }

    // Edit a message
    @Transactional
    public Message editMessage(String messageId, String requesterId,
                               String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getSenderEmail().equals(requesterId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }
        message.setContent(newContent);
        message.setEdited(true);
        message.setEditedAt(OffsetDateTime.now());
        Message saved = messageRepository.save(message);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<User> getRoomMembers(String roomId) {
        // 1. Find all RoomMember records for this room
        try {
            // 1. Convert String to Long correctly (NEVER use Long.getLong)
            Long roomLongId = Long.parseLong(roomId);

            // 2. Find all membership records for this room
            // NOTE: Ensure your repository method is findByRoomId(Long roomId)
            // or findByRoom_Id(Long roomId) depending on your repo setup
            List<RoomMember> memberships = roomMemberRepository.findByRoomId(roomLongId);

            // 3. Just extract the User object from each membership
            return memberships.stream()
                    .map(RoomMember::getUser) // This gets the actual User entity
                    .collect(Collectors.toList());

        } catch (NumberFormatException e) {
            // Handle case where roomId isn't a valid number
            return Collections.emptyList();
        }
    }
    @Transactional
    public void removeMember(String roomId, String targetUserId, String requesterEmail) {
        // 1. Get requester user info
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User target = userRepository.findById(Long.parseLong(targetUserId)).orElseThrow(()->new ResourceNotFoundException("User not found"));
        // 2. Get the Room
        ChatRoom room = chatRoomRepository.findById(Long.parseLong(roomId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // 3. Security: Only the room creator (admin) can remove members
        if (!room.getCreatedBy().getId().equals(requester.getId())) {
            throw new UnauthorizedException("Only the room admin can remove members");
        }

        // 4. Prevent admin from removing themselves (optional)
        Long targetId = Long.parseLong(targetUserId);
        if (targetId.equals(room.getCreatedBy().getId())) {
            throw new UnsupportedOperationException("Admin cannot be removed from the room");
        }

        Message msg = new Message();
        msg.setRoomId(roomId);
        msg.setSenderId("SYSTEM");
        msg.setSenderName("System");
        msg.setContent(target.getUsername() + " was removed by " + requester.getUsername());
        msg.setType(MessageType.SYSTEM);
        msg.setTimestamp(OffsetDateTime.now());
        messageRepository.save(msg);
        // 4. Broadcast to WebSocket so everyone currently in the room sees it immediately
        messagingTemplate.convertAndSend("/topic/room/" + roomId, msg);
        // 5. Delete the membership
        roomMemberRepository.deleteByRoomIdAndUserId(Long.parseLong(roomId), Long.parseLong(targetUserId));
        messagingTemplate.convertAndSend("/topic/user/" + targetUserId + "/kicked", roomId);

    }
}
