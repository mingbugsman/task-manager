-- Update project id

ALTER TABLE activity_logs
ADD COLUMN project_id BIGINT NULL,
ADD CONSTRAINT fk_logs_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE SET NULL;


 ALTER TABLE activity_logs
 ADD COLUMN ip_address VARCHAR(50) NULL;