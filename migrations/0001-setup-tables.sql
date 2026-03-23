CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS

CREATE TYPE staff_type AS ENUM (
  'admin',
  'staff'
);

CREATE TYPE loyalty_program_type AS ENUM (
  'stamps',
  'points',
  'cashback'
);

CREATE TYPE loyalty_activity_type AS ENUM (
  'earn',
  'redeem'
);

-- BUSINESSES

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    owner_id uuid NOT NULL REFERENCES auth.users(id)
);

-- STAFF

CREATE TABLE staff (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id UUID NOT NULL
        REFERENCES businesses(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    type staff_type NOT NULL,

    name TEXT NOT NULL,
    email TEXT NOT NULL,

    active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (business_id, email)
);

-- LOYALTY PROGRAMS

CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    business_id UUID NOT NULL
        DEFAULT get_user_business_id()
        REFERENCES businesses(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    type loyalty_program_type NOT NULL,

    reward_description TEXT,

    points_percentage NUMERIC(5,2),
    cashback_percentage NUMERIC(5,2),
    reward_cost INTEGER,

    limit_one_per_day BOOLEAN DEFAULT false,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now(),

    CHECK (points_percentage IS NULL OR (points_percentage >= 0 AND points_percentage <= 100)),
    CHECK (cashback_percentage IS NULL OR (cashback_percentage >= 0 AND cashback_percentage <= 100)),

    CHECK (
        (type = 'points' AND points_percentage IS NOT NULL)
        OR
        (type = 'cashback' AND cashback_percentage IS NOT NULL)
        OR
        (type = 'stamps' AND reward_cost IS NOT NULL)
    )
);

-- PROGRAM MEMBERSHIPS

CREATE TABLE program_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    program_id UUID NOT NULL
        REFERENCES loyalty_programs(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    balance NUMERIC(10,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(program_id, user_id)
);

-- CARD ACTIVITY

CREATE TABLE card_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    membership_id UUID NOT NULL
        REFERENCES program_memberships(id)
        ON DELETE CASCADE,

    program_id UUID NOT NULL
        REFERENCES loyalty_programs(id)
        ON DELETE CASCADE,

    type loyalty_activity_type NOT NULL,

    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,

    purchase_amount NUMERIC(10,2),

    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    registered_by_staff_id BIGINT
        REFERENCES staff(id),

    metadata JSONB
);

-- INDEXES

CREATE INDEX idx_staff_business
ON staff(business_id);

CREATE INDEX idx_loyalty_programs_business
ON loyalty_programs(business_id);

CREATE INDEX idx_program_memberships_program
ON program_memberships(program_id);

CREATE INDEX idx_program_memberships_user
ON program_memberships(user_id);

CREATE INDEX idx_card_activity_membership
ON card_activity(membership_id);

CREATE INDEX idx_card_activity_program
ON card_activity(program_id);

CREATE INDEX idx_card_activity_registered_at
ON card_activity(registered_at);


ALTER TABLE program_memberships
ADD COLUMN public_id UUID NOT NULL DEFAULT uuid_generate_v4();

CREATE UNIQUE INDEX program_memberships_public_id_idx
ON program_memberships(public_id);

ALTER TABLE loyalty_programs
ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX loyalty_programs_public_id_idx
ON loyalty_programs(public_id);


ALTER TABLE program_memberships
ADD COLUMN business_id UUID;


UPDATE program_memberships pm
SET business_id = lp.business_id
FROM loyalty_programs lp
WHERE pm.program_id = lp.id;


SELECT *
FROM program_memberships
WHERE business_id IS NULL;


ALTER TABLE program_memberships
ADD CONSTRAINT program_memberships_business_id_fkey
FOREIGN KEY (business_id)
REFERENCES businesses(id)
ON DELETE CASCADE;

ALTER TABLE program_memberships
ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_program_memberships_business
ON program_memberships(business_id);

ALTER TABLE card_activity
ADD COLUMN business_id UUID;

UPDATE card_activity ca
SET business_id = pm.business_id
FROM program_memberships pm
WHERE ca.membership_id = pm.id;

SELECT *
FROM card_activity
WHERE business_id IS NULL;

ALTER TABLE card_activity
ADD CONSTRAINT card_activity_business_id_fkey
FOREIGN KEY (business_id)
REFERENCES businesses(id)
ON DELETE CASCADE;

ALTER TABLE card_activity
ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_card_activity_business
ON card_activity(business_id);

ALTER TABLE loyalty_programs
ADD COLUMN card_theme TEXT NOT NULL DEFAULT 'neutral';