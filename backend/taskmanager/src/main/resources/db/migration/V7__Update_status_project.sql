-- update: field status for project schema

ALTER TABLE projects
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
COMMENT 'Trạng thái dự án: ACTIVE, ON_HOLD, COMPLETED, ARCHIVED';