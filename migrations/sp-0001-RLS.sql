CREATE OR REPLACE FUNCTION is_business_admin(business_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff
    WHERE user_id = auth.uid()
    AND business_id = business_uuid
    AND type = 'admin'
    AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_business_staff(business_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff
    WHERE user_id = auth.uid()
    AND business_id = business_uuid
    AND active = true
  );
$$;

REVOKE ALL ON FUNCTION is_business_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_business_admin(uuid) TO authenticated;

REVOKE ALL ON FUNCTION is_business_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_business_staff(uuid) TO authenticated;

  -- BUSINESS

CREATE POLICY "admin read business"
ON businesses
FOR SELECT
TO authenticated
USING (
  is_business_admin(id)
);

CREATE POLICY "admin update business"
ON businesses
FOR UPDATE
TO authenticated
USING (
  is_business_admin(id)
);

-- ADMIN STAFF

CREATE POLICY "admin read staff"
ON staff
FOR ALL
TO authenticated
USING (
  is_business_admin(business_id)
)
WITH CHECK (
  is_business_admin(business_id)
);

-- LOYALTY PROGRAMS

CREATE POLICY "admin manage programs"
ON loyalty_programs
FOR ALL
TO authenticated
USING (
  is_business_admin(business_id)
)
WITH CHECK (
  is_business_admin(business_id)
);

CREATE POLICY "authenticated users view all programs"
ON loyalty_programs
FOR SELECT
TO authenticated
USING (true);

-- STAFF ACTIVITY

CREATE POLICY "staff read activity"
ON card_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM program_memberships lc
    JOIN loyalty_programs lp ON lp.id = lc.program_id
    WHERE lc.id = membership_id
    AND is_business_staff(lp.business_id)
  )
);

CREATE POLICY "staff register activity"
ON card_activity
FOR INSERT
TO authenticated
WITH CHECK (
  registered_by_staff_id IN (
    SELECT id
    FROM staff
    WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM program_memberships lc
    JOIN loyalty_programs lp ON lp.id = lc.program_id
    WHERE lc.id = membership_id
    AND is_business_staff(lp.business_id)
  )
);

-- CUSTOMER

CREATE POLICY "customer read own cards"
ON program_memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "customer create card"
ON program_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "customer read activity"
ON card_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM program_memberships lc
    WHERE lc.id = membership_id
    AND lc.user_id = auth.uid()
  )
);

CREATE INDEX idx_staff_user 
ON staff(user_id);

CREATE INDEX idx_loyalty_program_business
ON loyalty_programs(business_id);

CREATE INDEX idx_program_memberships_program
ON program_memberships(program_id);

CREATE INDEX idx_program_memberships_user
ON program_memberships(user_id);

CREATE INDEX idx_card_activity_card
ON card_activity(membership_id);


CREATE POLICY "staff read memberships"
ON program_memberships
FOR SELECT
TO authenticated
USING (
  is_business_staff(business_id)
)

CREATE POLICY "staff update memberships"
ON program_memberships
FOR UPDATE
TO authenticated
USING (
  is_business_staff(business_id)
)
WITH CHECK (
  is_business_staff(business_id)
);



create policy "authenticated users can read businesses"
on public.businesses
for select
to authenticated
using (true);

CREATE POLICY "staff register memberships"
ON program_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM loyalty_programs lp
    WHERE lp.id = program_id
    AND is_business_staff(lp.business_id)
  )
);


CREATE POLICY "authenticated users can create business"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (true);