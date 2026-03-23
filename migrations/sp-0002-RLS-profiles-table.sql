alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);


-- FUNCTIONS
-- Find name by contact (phone or email)
create or replace function find_profile_by_contact(input text)
returns table (
  id uuid,
  name text,
  email text,
  phone_number text
)
language plpgsql
security definer
set search_path = public
as $$
begin

  -- Only staff users can use this function
  if not exists (
    select 1
    from staff
    where user_id = auth.uid()
      and active = true
  ) then
    return;
  end if;

  return query
  select p.id, p.name, p.email, p.phone_number
  from profiles p
  where p.phone_number = input
     or p.email = input
  limit 1;

end;
$$;

-- Revoke permissions from public
revoke all on function find_profile_by_contact from public;
grant execute on function find_profile_by_contact to authenticated;
