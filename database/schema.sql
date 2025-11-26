-- Database schema for WebSocket Chat
-- Run this to set up your database

CREATE DATABASE IF NOT EXISTS websocket_chat
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE websocket_chat;

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL DEFAULT 'general',
    user_id VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('message', 'system') NOT NULL DEFAULT 'message',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_created (conversation_id, created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default conversation
INSERT INTO conversations (id, name, created_by) VALUES
    ('general', 'General Chat', 'system')
ON DUPLICATE KEY UPDATE name = name;
