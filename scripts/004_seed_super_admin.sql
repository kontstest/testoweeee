-- This script creates a super admin user
-- You'll need to manually create this user in Supabase Auth first
-- Then update the UUID below with the actual user ID

-- Example: Insert super admin profile (replace with actual user ID after creating in Supabase Auth)
-- insert into public.profiles (id, email, role, first_name, last_name)
-- values (
--   'YOUR-SUPER-ADMIN-UUID-HERE',
--   'admin@example.com',
--   'super_admin',
--   'Super',
--   'Admin'
-- );

-- For now, we'll create a function that can be called to promote a user to super admin
create or replace function public.promote_to_super_admin(user_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set role = 'super_admin'
  where email = user_email;
end;
$$;
