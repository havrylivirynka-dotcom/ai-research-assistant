insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('uploads', 'uploads', false, 52428800, array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]),
  ('pdf', 'pdf', false, 52428800, array['application/pdf']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('exports', 'exports', false, 20971520, null)
on conflict (id) do nothing;

-- Files are stored under a `${auth.uid()}/...` prefix so ownership can be
-- checked from the path itself without an extra lookup table.

create policy "Users can read their own files in private buckets"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('uploads', 'pdf', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their own files in private buckets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('uploads', 'pdf', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own files in private buckets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('uploads', 'pdf', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view avatars"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
