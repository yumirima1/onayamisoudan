alter table public.posts
add column if not exists reply_token_hash text check (reply_token_hash is null or char_length(reply_token_hash) = 64),
add column if not exists reply_url_sent_at timestamptz;

drop policy if exists "anon can insert posts only" on public.posts;
create policy "anon can insert posts only"
on public.posts
for insert
to anon, authenticated
with check (
  char_length(title) between 1 and 80
  and char_length(body) between 1 and 2000
  and (email is null or char_length(email) <= 254)
  and (reply_token_hash is null or char_length(reply_token_hash) = 64)
  and urgency in ('normal', 'soon', 'risky')
);
