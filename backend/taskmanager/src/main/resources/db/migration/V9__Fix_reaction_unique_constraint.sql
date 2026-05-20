-- One reaction per user per entity (not per reaction type).
-- Removes duplicate rows and fixes unique key so changing reaction type cannot fail.
--
-- MySQL uses uk_user_reaction (starts with user_id) for fk_reactions_user.
-- Add the new unique index BEFORE dropping the old one.

DELETE r1
FROM reactions r1
INNER JOIN reactions r2
    ON r1.user_id = r2.user_id
    AND r1.entity_type = r2.entity_type
    AND r1.entity_id = r2.entity_id
    AND r1.reaction_id < r2.reaction_id;

ALTER TABLE reactions
    ADD CONSTRAINT uk_user_entity_reaction UNIQUE (user_id, entity_type, entity_id);

ALTER TABLE reactions DROP INDEX uk_user_reaction;
