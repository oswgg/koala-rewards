-- Add profile_id column to program_memberships table
ALTER TABLE program_memberships
ADD COLUMN profile_id uuid;

-- Backfill profile_id column
UPDATE program_memberships pm
SET profile_id = p.id
FROM profiles p
WHERE pm.user_id = p.user_id;


-- Validate backfill
SELECT *
FROM program_memberships
WHERE profile_id IS NULL;

-- Add foreign key constraint to profile_id column
ALTER TABLE program_memberships
ADD CONSTRAINT program_memberships_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Set profile_id column to not null
ALTER TABLE program_memberships
ALTER COLUMN profile_id SET NOT NULL;

-- Drop user_id and fk constraint on user_id column
ALTER TABLE program_memberships
DROP CONSTRAINT program_memberships_user_id_fkey;

ALTER TABLE program_memberships
DROP COLUMN user_id;

create unique index profiles_phone_unique
on profiles(phone_number)
where user_id is null;