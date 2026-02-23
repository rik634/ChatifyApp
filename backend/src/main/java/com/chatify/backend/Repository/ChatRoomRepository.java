package com.chatify.backend.Repository;

import com.chatify.backend.Entity.ChatRoom;
import com.chatify.backend.Enum.ChatRoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByTypeAndActiveTrue(ChatRoomType type);

    @Query("""
        SELECT cr FROM ChatRoom cr
        JOIN RoomMember rm1 ON rm1.room = cr AND rm1.user.id = :userId1
        JOIN RoomMember rm2 ON rm2.room = cr AND rm2.user.id = :userId2
        WHERE cr.type = :roomType
        AND cr.active = true
    """)
    Optional<ChatRoom> findExistingDm(@Param("userId1") Long userId1,
                                      @Param("userId2") Long userId2,
                                      @Param("roomType") ChatRoomType roomType);
}