alter table public.posts
add column if not exists email text check (email is null or char_length(email) <= 254),
add column if not exists reply_notified_at timestamptz;

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
