create or replace function create_profile_and_memberships(
  input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
  v_program_ids uuid[];
  v_profile_id uuid;
  v_business_id uuid;
begin
  -- =========================
  -- 1. Parse input
  -- =========================
  v_name := input->>'name';
  v_phone := input->>'phone';

  select array_agg(value::uuid)
  into v_program_ids
  from jsonb_array_elements_text(input->'programsPublicIds');

  if v_phone is null or v_phone = '' then
    raise exception 'Phone is required';
  end if;

  if v_program_ids is null or array_length(v_program_ids, 1) = 0 then
    raise exception 'No programs provided';
  end if;

  -- =========================
  -- 2. Validar negocio
  -- =========================
  select business_id
  into v_business_id
  from loyalty_programs
  where public_id = v_program_ids[1];

  if v_business_id is null then
    raise exception 'Invalid program';
  end if;

  if not is_business_staff(v_business_id) then
    raise exception 'Not authorized';
  end if;

  if exists (
    select 1
    from loyalty_programs
    where public_id = ANY(v_program_ids)
      and business_id <> v_business_id
  ) then
    raise exception 'Programs must belong to same business';
  end if;

  -- =========================
  -- 3. Buscar profile existente
  -- =========================
  select id
  into v_profile_id
  from profiles
  where phone_number = v_phone
  limit 1;

  -- =========================
  -- 4. Crear profile si no existe
  -- =========================
  if v_profile_id is null then
    insert into profiles (
      name,
      phone_number
    )
    values (
      v_name,
      v_phone
    )
    returning id into v_profile_id;
  end if;

  -- =========================
  -- 5. Crear memberships (sin duplicar)
  -- =========================
  insert into program_memberships (
    program_id,
    profile_id,
    business_id
  )
  select
    lp.id,
    v_profile_id,
    lp.business_id
  from loyalty_programs lp
  where lp.public_id = ANY(v_program_ids)
  and not exists (
    select 1
    from program_memberships pm
    where pm.program_id = lp.id
      and pm.profile_id = v_profile_id
  );

  return v_profile_id;
end;
$$;

revoke all on function create_profile_and_memberships from public;
grant execute on function create_profile_and_memberships to authenticated;