CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT business_id
  FROM staff
  WHERE user_id = auth.uid()
  LIMIT 1
$$;



REVOKE ALL ON FUNCTION get_user_business_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_business_id() TO authenticated;

ALTER TABLE loyalty_programs
ALTER COLUMN business_id
SET DEFAULT get_user_business_id();

CREATE OR REPLACE FUNCTION program_memberships_set_business()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.business_id IS NULL THEN
    NEW.business_id := get_program_business(NEW.program_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_program_memberships_business
BEFORE INSERT ON program_memberships
FOR EACH ROW
EXECUTE FUNCTION program_memberships_set_business();

CREATE OR REPLACE FUNCTION get_program_business(program_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT business_id
  FROM loyalty_programs
  WHERE id = program_uuid
$$;


CREATE OR REPLACE FUNCTION card_activity_set_business()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.business_id IS NULL THEN
    NEW.business_id := get_user_business_id();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_card_activity_business
BEFORE INSERT ON card_activity
FOR EACH ROW
EXECUTE FUNCTION card_activity_set_business();

CREATE OR REPLACE FUNCTION create_business_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  SELECT 
    raw_user_meta_data->>'name',
    email
  INTO user_name, user_email
  FROM auth.users
  WHERE id = auth.uid();

  INSERT INTO staff (user_id, name, email, business_id, type, active)
  VALUES (
    auth.uid(),
    COALESCE(user_name, 'Admin'),
    user_email,
    NEW.id,
    'admin',
    true
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created
AFTER INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION create_business_owner();


CREATE OR REPLACE FUNCTION set_business_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_business
BEFORE INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION set_business_owner();