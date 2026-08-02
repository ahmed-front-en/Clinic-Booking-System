ALTER TABLE users
ADD COLUMN full_name VARCHAR(255);

UPDATE users u
SET full_name = p.full_name
FROM patients p
WHERE p.user_id = u.id;
