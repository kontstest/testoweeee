-- Create storage bucket for event photos
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

-- Create storage bucket for event images (hero images, etc)
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Set up storage policies for event-photos
create policy "Anyone can view event photos"
  on storage.objects for select
  using (bucket_id = 'event-photos');

create policy "Authenticated users can upload event photos"
  on storage.objects for insert
  with check (
    bucket_id = 'event-photos' 
    and auth.role() = 'authenticated'
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'event-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up storage policies for event-images
create policy "Anyone can view event images"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "Authenticated users can upload event images"
  on storage.objects for insert
  with check (
    bucket_id = 'event-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update their event images"
  on storage.objects for update
  using (
    bucket_id = 'event-images' 
    and auth.role() = 'authenticated'
  );
