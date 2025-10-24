-- Drop existing policies for profiles
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Super admins can view all profiles" on public.profiles;

-- Create new, more permissive policies for profiles
-- Allow users to insert their own profile (needed for signup)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Allow users to view their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow super admins to view all profiles
create policy "Super admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Allow super admins to do everything with profiles
create policy "Super admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Update the handle_new_user function to be more robust
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile with error handling
  insert into public.profiles (id, email, role, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'guest'),
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    updated_at = now();

  return new;
exception
  when others then
    -- Log error but don't fail the signup
    raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
