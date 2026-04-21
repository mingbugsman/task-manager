
-- Table User: update enable account for verified email

ALTER TABLE users ADD COLUMN enabled TINYINT(1) DEFAULT 0;
