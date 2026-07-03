-- Recent Supabase projects no longer auto-expose new public-schema tables to
-- the Data API roles (auto_expose_new_tables defaults to false). RLS policies
-- only restrict rows within privileges a role already has, so without these
-- GRANTs every request is rejected with "permission denied for table ..."
-- before RLS is even evaluated. This applies even to service_role: bypassrls
-- only skips row-level policies, it does not imply table-level ACL grants.

grant select, update on public.users to authenticated;
grant select, update on public.user_settings to authenticated;
grant select, insert on public.api_usage to authenticated;
grant select, insert, delete on public.search_history to authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.saved_articles to authenticated;
grant select, insert, update, delete on public.bibliography to authenticated;
grant select, insert, update, delete on public.uploads to authenticated;

grant select, insert, delete on public.ai_chats to authenticated;
grant select, insert on public.ai_messages to authenticated;

grant select on public.knowledge_documents to authenticated;
grant select on public.knowledge_chunks to authenticated;
grant execute on function public.match_knowledge_chunks(extensions.vector, integer, float) to authenticated;

-- The service role (used by lib/supabase/admin.ts for background processing
-- and ops scripts) needs full access across every table.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all functions in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on functions to service_role;
