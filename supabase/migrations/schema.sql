create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  email text check (email is null or char_length(email) <= 254),
  age_group text,
  category text not null,
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  urgency text not null default 'normal' check (urgency in ('normal', 'soon', 'risky')),
  allow_public boolean not null default false,
  allow_stream boolean not null default false,
  status text not null default 'unreplied' check (status in ('unreplied', 'replied', 'hidden')),
  admin_reply text,
  admin_memo text,
  public_draft_title text,
  public_draft_body text,
  public_draft_reply text,
  risk_flags jsonb,
  ai_summary jsonb,
  ai_drafts jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  replied_at timestamptz,
  reply_notified_at timestamptz
);

create table if not exists public.public_posts (
  id uuid primary key default gen_random_uuid(),
  source_post_id uuid references public.posts(id) on delete set null,
  category text not null,
  public_title text not null,
  public_body text not null,
  public_reply text not null,
  archive_status text not null default 'published' check (archive_status in ('published', 'draft', 'hidden')),
  stream_url text,
  is_stream_used boolean not null default false,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  tag text not null,
  visibility text not null default 'public' check (visibility in ('public', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists public_posts_touch_updated_at on public.public_posts;
create trigger public_posts_touch_updated_at
before update on public.public_posts
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function public.source_allows_public(source_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.posts
    where id = source_id and allow_public = true
  );
$$;

create or replace function public.source_allows_stream(source_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.posts
    where id = source_id and allow_stream = true
  );
$$;

create or replace function public.log_admin_table_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    return coalesce(new, old);
  end if;

  target := coalesce(new.id, old.id);

  insert into public.admin_audit_logs (
    admin_id,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    auth.uid(),
    lower(tg_op) || '_' || tg_table_name,
    tg_table_name,
    target,
    '{}'::jsonb
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists posts_admin_audit on public.posts;
create trigger posts_admin_audit
after update or delete on public.posts
for each row execute function public.log_admin_table_change();

drop trigger if exists public_posts_admin_audit on public.public_posts;
create trigger public_posts_admin_audit
after insert or update or delete on public.public_posts
for each row execute function public.log_admin_table_change();

create or replace view public.public_posts_view as
select
  id,
  published_at,
  public_title,
  public_body,
  public_reply,
  category
from public.public_posts
where archive_status = 'published';

alter view public.public_posts_view set (security_invoker = true);

alter table public.posts enable row level security;
alter table public.public_posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "anon can insert posts only" on public.posts;
create policy "anon can insert posts only"
on public.posts
for insert
to anon, authenticated
with check (
  char_length(title) between 1 and 80
  and char_length(body) between 1 and 2000
  and (email is null or char_length(email) <= 254)
  and urgency in ('normal', 'soon', 'risky')
);

drop policy if exists "admins can read posts" on public.posts;
create policy "admins can read posts"
on public.posts
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can insert posts" on public.posts;
create policy "admins can insert posts"
on public.posts
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins can update posts" on public.posts;
create policy "admins can update posts"
on public.posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete posts" on public.posts;
create policy "admins can delete posts"
on public.posts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read published public posts" on public.public_posts;
create policy "public can read published public posts"
on public.public_posts
for select
to anon, authenticated
using (archive_status = 'published' or public.is_admin());

drop policy if exists "admins can insert public posts" on public.public_posts;
create policy "admins can insert public posts"
on public.public_posts
for insert
to authenticated
with check (
  public.is_admin()
  and source_post_id is not null
  and public.source_allows_public(source_post_id)
  and (stream_url is null or public.source_allows_stream(source_post_id))
);

drop policy if exists "admins can update public posts" on public.public_posts;
create policy "admins can update public posts"
on public.public_posts
for update
to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and source_post_id is not null
  and public.source_allows_public(source_post_id)
  and (stream_url is null or public.source_allows_stream(source_post_id))
);

drop policy if exists "admins can delete public posts" on public.public_posts;
create policy "admins can delete public posts"
on public.public_posts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read tags for published posts" on public.post_tags;
create policy "public can read tags for published posts"
on public.post_tags
for select
to anon, authenticated
using (
  visibility = 'public'
  and exists (
    select 1 from public.posts
    join public.public_posts on public_posts.source_post_id = posts.id
    where posts.id = post_tags.post_id
    and public_posts.archive_status = 'published'
  )
);

drop policy if exists "admins can manage tags" on public.post_tags;
create policy "admins can manage tags"
on public.post_tags
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can read admin profiles" on public.admin_profiles;
create policy "admins can read admin profiles"
on public.admin_profiles
for select
to authenticated
using (public.is_admin() or id = auth.uid());

drop policy if exists "admins can read audit logs" on public.admin_audit_logs;
create policy "admins can read audit logs"
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can insert audit logs" on public.admin_audit_logs;
create policy "admins can insert audit logs"
on public.admin_audit_logs
for insert
to authenticated
with check (public.is_admin() and admin_id = auth.uid());
