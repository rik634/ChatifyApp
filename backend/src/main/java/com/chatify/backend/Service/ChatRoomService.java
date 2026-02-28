package com.chatify.backend.Service;

import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Enum.ChatRoomType;
import com.chatify.backend.Enum.MemberType;
import com.chatify.backend.Exception.ConflictException;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Exception.UnauthorizedException;
import com.chatify.backend.Repository.ChatRoomRepository;
import com.chatify.backend.Repository.MessageRepository;
import com.chatify.backend.Repository.RoomMemberRepository;
import com.chatify.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatRoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoomMemberRepository roomMemberRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    // Create a GROUP or CHANNEL room
    @Transactional
    public ChatRoom createRoom(String name, String description, ChatRoomType type, User createdBy)
    {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setDescription(description);
        room.setType(type);
        room.setCreatedBy(createdBy);

        ChatRoom savedChatRoom = chatRoomRepository.save(room);
        addMember(room,createdBy,MemberType.ADMIN, createdBy.getUsername());
        return savedChatRoom;
    }

    // Create or retrieve a DM between two users
    @Transactional
    public ChatRoom getOrCreateDM(User user1, User user2)
    {
        return chatRoomRepository.findExistingDm(user1.getId(),user2.getId(),ChatRoomType.DM).orElseGet(
                ()->{
                    ChatRoom dm = new ChatRoom();
                    dm.setType(ChatRoomType.DM);
                    dm.setCreatedBy(user1);
                    dm.setActive(true);

                    ChatRoom saved = chatRoomRepository.save(dm);
                    addMember(saved, user1,MemberType.MEMBER,user1.getUsername());
                    addMember(saved,user2,MemberType.MEMBER,user1.getUsername());
                    return saved;
                }
        );
    }
    // Add a member to a room (with duplicate check)
    @Transactional
    public void addMember(ChatRoom room, User user, MemberType type,String adminUsername)
    {
        if(roomMemberRepository.existsByRoomIdAndUserId(String.valueOf(room.getId()),user.getId()))
        {
            throw new ConflictException("User is already the member of this chat room");
        }
        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        member.setType(type);
        roomMemberRepository.save(member);
        // 2. Create and Save the System Message (MongoDB)
        // Only do this for Groups/Channels, or whenever a new user is invited
        if (adminUsername != null) {
            com.chatify.backend.Entity.Message systemMsg = new com.chatify.backend.Entity.Message();
            systemMsg.setRoomId(String.valueOf(room.getId()));
            systemMsg.setSenderId("SYSTEM");
            systemMsg.setSenderName("System");
            systemMsg.setContent(user.getUsername() + " was added by " + adminUsername);
            systemMsg.setType(com.chatify.backend.Enum.MessageType.SYSTEM);
            systemMsg.setTimestamp(java.time.OffsetDateTime.now());

            // THIS LINE creates the 'chatify_messages' DB in Compass
            messageRepository.save(systemMsg);

            // 3. Broadcast to WebSocket
            messagingTemplate.convertAndSend("/topic/room/" + room.getId(), systemMsg);
        }
    }
    // Remove a member (only ADMIN can remove others)
    @Transactional
    public  void removeMember(Long roomId, Long requesterId, Long targetUserId)
    {
        boolean isAdmin = roomMemberRepository.existsByRoomIdAndUserIdAndType(roomId,requesterId,MemberType.ADMIN);
        if(!isAdmin)
        {
            throw new UnauthorizedException("You don't have permission to remove the member");
        }

        roomMemberRepository.deleteByRoomIdAndUserId(roomId,targetUserId);
    }

    // Get all rooms for a user (their sidebar list)
    @Transactional(readOnly = true)
    public List<ChatRoom> getUserRooms(Long userId)
    {
        List<ChatRoom> rooms = roomMemberRepository.findByUserId(userId)
                .stream()
                .map(RoomMember::getRoom)  // or rm -> rm.getChatRoom()
                .collect(Collectors.toList());
        return rooms;
    }

    // Soft delete a room (only creator/admin can do this)
    public  void deactivateRoom(Long roomId, Long requesterId)
    {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(()->new ResourceNotFoundException("Room not found"));

        if(!room.getCreatedBy().getId().equals(requesterId))
        {
            throw new UnauthorizedException("You don't have the permission to deactivate this room");
        }
        room.setActive(false);
        chatRoomRepository.save(room);
    }
}
