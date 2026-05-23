-- 管理者ログイン診断SQL
-- Supabase SQL Editorで実行してください。
-- AUTH_USER_ID_HERE を Supabase Auth の対象ユーザーUUIDに置き換えます。

-- 1. Authユーザーが存在するか確認
select
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
from auth.users
where id = 'AUTH_USER_ID_HERE';

-- 2. admin_profiles に同じUUIDが登録されているか確認
select
  id,
  display_name,
  role,
  is_active,
  created_at
from public.admin_profiles
where id = 'AUTH_USER_ID_HERE';

-- 3. 管理者登録テンプレート
-- 既に同じidがある場合は display_name / role / is_active を更新します。
insert into public.admin_profiles (id, display_name, role, is_active)
values ('AUTH_USER_ID_HERE', '管理者名', 'admin', true)
on conflict (id) do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  is_active = excluded.is_active;

-- 4. is_admin() が見る条件と同じ条件で確認
select exists (
  select 1
  from public.admin_profiles
  where id = 'AUTH_USER_ID_HERE'
  and is_active = true
) as admin_profile_active;

-- 5. RLS policy が不足している場合の修正SQL案
-- RLSは無効化せず、本人が自分のadmin_profiles行を読めるpolicyを追加します。
drop policy if exists "admins can read admin profiles" on public.admin_profiles;
create policy "admins can read admin profiles"
on public.admin_profiles
for select
to authenticated
using (public.is_admin() or id = auth.uid());

-- 6. public.is_admin() の再作成SQL案
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
    and is_active = true
  );
$$;
