create or replace function get_my_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id
  from profiles
  where user_id = auth.uid()
$$;

revoke all on function get_my_profile_id() from public;
grant execute on function get_my_profile_id() to authenticated;


drop policy "customer read own cards" on program_memberships;
drop policy "customer create card" on program_memberships;
drop policy "customer read activity" on card_activity;

drop index if exists idx_program_memberships_user;

alter table program_memberships drop column user_id;


create policy "customer read own cards"
on program_memberships
for select
to authenticated
using (
  profile_id = get_my_profile_id()
);


create policy "customer create card"
on program_memberships
for insert
to authenticated
with check (
  profile_id = get_my_profile_id()
);

create policy "customer read activity"
on card_activity
for select
to authenticated
using (
  exists (
    select 1
    from program_memberships pm
    where pm.id = membership_id
      and pm.profile_id = get_my_profile_id()
  )
);

create index idx_program_memberships_profile
on program_memberships(profile_id);