package com.chatify.backend.Repository;


import com.chatify.backend.Entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
@Repository
public interface MessageRepository extends MongoRepository<Message,Long> {

    // Fetch message history for a room, newest last
    List<Message> findByRoomIdAndIsDeletedFalseOrderByTimestampAsc(String roomId);

    // Fetch last N messages (for initial load when opening a room)
    Page<Message> findByRoomIdAndIsDeletedFalse(String roomId, Pageable pageable);

    // Count unread messages (messages after a given timestamp)
    long countByRoomIdAndTimestampAfter(String roomId, OffsetDateTime after);
}
