-- Backfill
insert into public.profiles (
  id,
  name,
  email,
  phone_number
)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', ''),
  u.email,
  u.raw_user_meta_data->>'phone_number'
from auth.users u
on conflict (id) do nothing;


-- Validate counts
select count(*) from auth.users;
select count(*) from profiles;