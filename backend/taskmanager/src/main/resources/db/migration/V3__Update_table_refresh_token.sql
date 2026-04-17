
-- Table refreshtoken: storage Refresh Token for validate JWT
CREATE TABLE refreshtoken (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME(6) NOT NULL,

    CONSTRAINT fk_refreshtoken_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;