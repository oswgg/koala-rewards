create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone_number text,
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (
    id,
    name,
    email,
    phone_number
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, null),
    coalesce(new.raw_user_meta_data->>'phone_number', null)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();