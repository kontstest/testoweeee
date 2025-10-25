-- Drop old restrictive policies
drop policy if exists "Authenticated users can upload event photos" on storage.objects;
drop policy if exists "Users can delete their own photos" on storage.objects;

-- Allow anonymous users to upload photos (guests don't need to log in)
create policy "Anyone can upload event photos"
  on storage.objects for insert
  with check (bucket_id = 'event-photos');

-- Allow users to delete photos in their event folder
create policy "Users can delete photos in event folders"
  on storage.objects for delete
  using (bucket_id = 'event-photos');

-- Update RLS policy for photos table to allow anonymous inserts
drop policy if exists "Users can insert their own photos" on photos;

-- Allow anonymous photo uploads
create policy "Anyone can insert photos"
  on photos for insert
  with check (true);

-- Allow anyone to view photos
drop policy if exists "Users can view photos for their events" on photos;
create policy "Anyone can view photos"
  on photos for select
  using (true);
