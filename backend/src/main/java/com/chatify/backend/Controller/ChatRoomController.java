package com.chatify.backend.Controller;


import com.chatify.backend.DTO.ChatRoomResponse;
import com.chatify.backend.DTO.CreateRoomRequest;

import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Enum.ChatRoomType;
import com.chatify.backend.Enum.MemberType;
import com.chatify.backend.Exception.ResourceNotFoundException;
import com.chatify.backend.Exception.UnauthorizedException;
import com.chatify.backend.Repository.ChatRoomRepository;
import com.chatify.backend.Repository.RoomMemberRepository;
import com.chatify.backend.Repository.UserRepository;
import com.chatify.backend.Service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/rooms")
@RestController
public class ChatRoomController {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private RoomMemberRepository roomMemberRepository;
    // Get all rooms for the logged-in user
    @GetMapping("/my-rooms")
    public ResponseEntity<List<ChatRoom>> getRooms(@AuthenticationPrincipal UserDetails userDetails)
    {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(()->new RuntimeException("user not found"));
        return ResponseEntity.ok(chatRoomService.getUserRooms(user.getId()));
    }
    // Create a group or channel
    @PostMapping("/create")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody CreateRoomRequest createRoomRequest, @AuthenticationPrincipal UserDetails userDetails)
    {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(()->new RuntimeException("User not found"));
        ChatRoom room = chatRoomService.createRoom(createRoomRequest.getName(),createRoomRequest.getDescription(),createRoomRequest.getType(),user);
        return ResponseEntity.ok(room);
    }
    // Start or retrieve a DM
    @PostMapping("/dm/{targetUserId}")
    public ResponseEntity<ChatRoom> getOrCreateDM(@PathVariable Long targetUserId, @AuthenticationPrincipal UserDetails userDetails)
    {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(()->new RuntimeException("User not found"));
        User targetUser = userRepository.findById(targetUserId).orElseThrow(()->new RuntimeException("User not found"));
        ChatRoom dm = chatRoomService.getOrCreateDM(user,targetUser);
        return ResponseEntity.ok(dm);
    }
    @PostMapping("/{roomId}/members/{targetUserId}")
    public ResponseEntity<?> addMember(@PathVariable Long roomId, @PathVariable Long targetUserId, @AuthenticationPrincipal UserDetails userDetails)
    {
        ChatRoom room = new ChatRoom();
        room.setId(roomId);
        User user = userRepository.findById(targetUserId).orElseThrow(()->new RuntimeException("User not found"));
        chatRoomService.addMember(room, user, MemberType.MEMBER);
        return ResponseEntity.ok("Member added");
    }
    // Soft delete a room
    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userRepository.findByEmail(
                userDetails.getUsername()).orElseThrow();
        chatRoomService.deactivateRoom(roomId, requester.getId());
        return ResponseEntity.ok("Room deactivated");
    }
    // Get a single room by ID (with members)
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomResponse> getRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + roomId));

        // Verify requester is a member
        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow();

        if (!roomMemberRepository.existsByRoomIdAndUserId(
                roomId, user.getId())) {
            throw new UnauthorizedException(
                    "You are not a member of this room");
        }

        List<RoomMember> members =
                roomMemberRepository.findByRoomId(roomId);

        return ResponseEntity.ok(
                ChatRoomResponse.from(room, members));
    }

    // Get all public rooms (for discovery/browse)
    @GetMapping("/public")
    public ResponseEntity<List<ChatRoomResponse>> getPublicRooms() {
        return ResponseEntity.ok(
                chatRoomRepository
                        .findByTypeAndActiveTrue(ChatRoomType.CHANNEL)
                        .stream()
                        .map(room -> ChatRoomResponse.from(room,
                                roomMemberRepository.findByRoomId(room.getId())))
                        .collect(Collectors.toList())
        );
    }

}
