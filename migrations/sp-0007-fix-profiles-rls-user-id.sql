-- profiles: legacy rows used id = auth.users.id; new rows use user_id = auth.uid() and a separate profiles.id.
-- The old policy (auth.uid() = id) hides every profile where id is not the auth user id, so clients cannot
-- resolve profile_id even though the row exists.

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id or auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id or auth.uid() = id);
