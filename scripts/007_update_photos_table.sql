-- Add wishes and author_name columns to photos table
alter table public.photos 
  add column if not exists wishes text,
  add column if not exists author_name text;

-- Make uploaded_by nullable since guests don't need to log in
alter table public.photos 
  alter column uploaded_by drop not null;

-- Update RLS policy to allow anonymous photo uploads
drop policy if exists "Users can upload photos" on public.photos;

create policy "Anyone can upload photos to events"
  on public.photos for insert
  with check (true);

create policy "Anyone can view photos"
  on public.photos for select
  using (true);
