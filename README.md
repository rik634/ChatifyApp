# Chatify — Real-Time Chat Platform

A full-stack real-time chat application built with Java, Spring Boot, React, MongoDB, and MySQL. Designed to demonstrate production-grade architectural patterns including polyglot persistence, event-driven communication, and secure API design.

🔗 **Live Demo:** [chatify.vercel.app](https://chatify.vercel.app)
💻 **Backend Repo:** [github.com/yourusername/chatify-backend](https://github.com/yourusername/chatify-backend)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Vercel — chatify.vercel.app)               │
└──────────────────┬──────────────────┬───────────────────┘
                   │ REST API          │ WebSocket (STOMP)
                   │                  │
┌──────────────────▼──────────────────▼───────────────────┐
│                Spring Boot Backend                       │
│                (Railway — port 8080)                     │
│                                                          │
│  ┌─────────────────┐        ┌──────────────────────┐    │
│  │  REST Controllers│        │  WebSocket Controller │    │
│  │  /api/auth      │        │  /app/chat/{roomId}   │    │
│  │  /api/rooms     │        │  /topic/room/{roomId} │    │
│  └────────┬────────┘        └──────────┬───────────┘    │
│           │                            │                  │
│  ┌────────▼────────────────────────────▼───────────┐    │
│  │              Service Layer                        │    │
│  │   UserService │ ChatRoomService │ MessageService  │    │
│  └────────┬───────────────────────────┬────────────┘    │
│           │                           │                   │
│  ┌────────▼────────┐       ┌──────────▼──────────────┐  │
│  │  MySQL (JPA)    │       │  MongoDB (Spring Data)   │  │
│  │  Users          │       │  Messages                │  │
│  │  ChatRooms      │       │                          │  │
│  └─────────────────┘       └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Design & Rationale

This project implements **polyglot persistence** — using two databases, each chosen for its strengths relative to the data it stores. This is a pattern used in large-scale messaging systems at companies like LinkedIn and Uber.

### MySQL — Structured Relational Data

Used for **users** and **chat rooms** because this data is:
- Structured with a fixed schema
- Relational (rooms have members, users have roles)
- Low write frequency, high read consistency requirements
- Benefits from foreign key constraints and ACID transactions

```sql
-- Users Table
CREATE TABLE users (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at  DATETIME
);

-- Chat Rooms Table
CREATE TABLE chat_rooms (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) UNIQUE NOT NULL,
    created_at  DATETIME
);
```

### MongoDB — Document-Oriented Message Storage

Used for **messages** because this data is:
- Document-shaped with flexible, evolving structure
- Written at very high frequency (every message sent)
- Queried by room in chronological order — no complex joins needed
- Benefits from MongoDB's high write throughput and horizontal scalability

```json
// Message Document
{
  "_id": "64f3a2b1c3d4e5f6a7b8c9d0",
  "roomId": "1",
  "senderId": "42",
  "senderName": "john_doe",
  "content": "Hello everyone!",
  "timestamp": "2024-01-15T10:30:00"
}
```

**Why store `senderName` in MongoDB when it exists in MySQL?**

This is a deliberate **denormalization** decision. Since MySQL and MongoDB cannot perform native joins, fetching the sender's name for every message would require a separate MySQL lookup — expensive at scale. Storing `senderName` directly in the message document eliminates this cross-database call, trading a small amount of data redundancy for significantly better read performance.

---

## ⚡ Real-Time Communication — WebSocket + STOMP

REST APIs follow a request-response model — the client has to ask the server for new data. For a chat application this would require constant polling (e.g. "any new messages?" every second), which is inefficient and adds unnecessary latency.

**WebSocket** solves this by keeping a persistent, bidirectional connection open between the client and server. When a message is sent, the server **pushes** it to all subscribers instantly — no polling required.

**Why STOMP over raw WebSocket?**

Raw WebSocket provides the connection but no message routing. STOMP (Simple Text Oriented Messaging Protocol) adds:
- **Destinations** — clients subscribe to `/topic/room/123` and only receive messages for that room
- **Message routing** — the server broadcasts to the right destination automatically
- **SockJS fallback** — graceful degradation for browsers without WebSocket support

```
Client A sends:  /app/chat/room1  →  Spring routes to @MessageMapping
Spring saves to MongoDB
Spring broadcasts to:  /topic/room/room1
Client B & C receive instantly (subscribed to /topic/room/room1)
```

---

## 🔐 Security — Spring Security + JWT

Authentication uses **JSON Web Tokens (JWT)** — a stateless authentication mechanism:

1. User registers/logs in → server validates credentials → returns a signed JWT token
2. Client stores the token and sends it in every request header: `Authorization: Bearer <token>`
3. Spring Security intercepts every request, validates the token, and allows or rejects access
4. No session state stored on the server — scales horizontally without shared session storage

```
POST /api/auth/login
→ Validates email + password against MySQL
→ Returns: { "token": "eyJhbGciOiJIUzI1NiJ9..." }

GET /api/messages/room1
→ Header: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
→ Spring Security validates token → allows request
```

---

## 🧪 Testing Strategy

| Layer | Tool | What It Tests |
|---|---|---|
| Unit | JUnit 5 + Mockito | Service logic in isolation — mocks repositories |
| Integration | Spring Boot Test + MockMvc | Full HTTP request-response cycle |
| Manual | Postman | API contracts, edge cases, WebSocket flow |

**Unit tests** mock the database layer entirely — fast, isolated, no external dependencies.

**Integration tests** spin up the full Spring context and test real HTTP behavior including serialization, validation, and error handling.

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Java 17, Spring Boot 3.2 | Core application framework |
| Auth | Spring Security, JWT | Stateless authentication |
| Real-time | WebSocket, STOMP, SockJS | Bidirectional messaging |
| Relational DB | MySQL, Spring Data JPA | User and room persistence |
| Document DB | MongoDB, Spring Data MongoDB | Message persistence |
| Frontend | React | Chat UI |
| Hosting | Railway (backend + MySQL) | Backend deployment |
| Hosting | MongoDB Atlas | Cloud MongoDB |
| Hosting | Vercel (frontend) | Frontend deployment |
| Testing | JUnit 5, Mockito, MockMvc | Automated testing |
| Logging | SLF4J, Logback | Application observability |

---

## 📦 Running Locally

### Prerequisites
- Java 17+
- MySQL running locally
- MongoDB running locally
- Node.js + npm

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/chatify-backend
cd chatify-backend

# Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/chatify_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.data.mongodb.uri=mongodb://localhost:27017/chatify_messages
jwt.secret=yourSecretKey

# Run
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd chatify-frontend
npm install
REACT_APP_API_URL=http://localhost:8080 npm start
```

---

## 🎯 Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Polyglot persistence (MySQL + MongoDB) | Different data characteristics require different storage engines — relational for users, document for messages |
| STOMP over raw WebSocket | Built-in message routing and subscription management without custom implementation |
| JWT over sessions | Stateless auth scales horizontally — no shared session store needed |
| Denormalized senderName in MongoDB | Eliminates cross-database lookup on every message read |
| Layered architecture | Separation of concerns — controllers, services, repositories independently testable |

---

## 📁 Project Structure

```
src/main/java/com/chatify/
├── config/
│   ├── SecurityConfig.java
│   └── WebSocketConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ChatController.java
│   └── RoomController.java
├── service/
│   ├── UserService.java
│   ├── MessageService.java
│   └── ChatRoomService.java
├── repository/
│   ├── UserRepository.java        ← JpaRepository (MySQL)
│   ├── ChatRoomRepository.java    ← JpaRepository (MySQL)
│   └── MessageRepository.java     ← MongoRepository (MongoDB)
├── model/
│   ├── User.java                  ← @Entity (MySQL)
│   ├── ChatRoom.java              ← @Entity (MySQL)
│   └── Message.java               ← @Document (MongoDB)
├── security/
│   ├── JwtUtil.java
│   └── JwtAuthFilter.java
└── ChatifyApplication.java
```
