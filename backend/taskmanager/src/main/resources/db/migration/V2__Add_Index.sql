-- ==============================================================================
-- V2__Add_Index.sql
-- ==============================================================================

-- 1. Index Table Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at); 

-- 2. Index Table Comments
CREATE INDEX idx_comments_task_id ON comments(task_id);

-- 3. Index Table Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- 4. Index Polymorphic Index)
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_reactions_entity ON reactions(entity_type, entity_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);