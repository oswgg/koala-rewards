create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_phone text;
begin
  v_phone := new.raw_user_meta_data->>'phone_number';

  -- =========================
  -- 1. Si hay teléfono → intentar reutilizar profile
  -- =========================
  if v_phone is not null then
    select id
    into v_profile_id
    from profiles
    where phone_number = v_phone
      and user_id is null
    limit 1;

    if v_profile_id is not null then
      -- Vincular profile existente con el nuevo user
      update profiles
      set user_id = new.id,
          email = coalesce(new.email, email),
          name = coalesce(new.raw_user_meta_data->>'name', name)
      where id = v_profile_id;

      return new;
    end if;
  end if;

  -- =========================
  -- 2. Crear nuevo profile (si no existe)
  -- =========================
  insert into profiles (
    user_id,
    name,
    email,
    phone_number
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    v_phone
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;