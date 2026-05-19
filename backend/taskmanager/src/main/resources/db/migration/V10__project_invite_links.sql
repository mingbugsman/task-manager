CREATE TABLE project_invite_links (
    invite_link_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id     BIGINT       NOT NULL,
    token          VARCHAR(64)  NOT NULL,
    role           VARCHAR(50)  NOT NULL DEFAULT 'Member',
    created_by     BIGINT       NOT NULL,
    expires_at     TIMESTAMP    NULL,
    revoked_at     TIMESTAMP    NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_invite_token UNIQUE (token),
    CONSTRAINT fk_invite_project FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE,
    CONSTRAINT fk_invite_creator FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE INDEX idx_project_invite_project ON project_invite_links (project_id);
