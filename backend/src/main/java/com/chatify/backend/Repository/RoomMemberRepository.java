package com.chatify.backend.Repository;

import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Entity.RoomMember;
import com.chatify.backend.Entity.User;
import com.chatify.backend.Enum.MemberType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember,Long> {

    // Get all members of a room
    List<RoomMember> findByRoomId(Long roomId);
    // Get all rooms a user belongs to

    List<RoomMember> findByUserId(Long userId);

    // Check if a user is already a member of a room
    boolean existsByRoomIdAndUserId(String roomId, Long userId);

    // Check if a user is an admin of a room
    boolean existsByRoomIdAndUserIdAndType(Long roomId, Long userId,
                                             MemberType type);

    // Remove a user from a room
    void deleteByRoomIdAndUserId(Long roomId, Long userId);
}
