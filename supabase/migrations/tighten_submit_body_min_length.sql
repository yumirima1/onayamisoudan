alter table public.posts
drop constraint if exists posts_body_check;

alter table public.posts
add constraint posts_body_check check (char_length(body) between 20 and 2000);

drop policy if exists "anon can insert posts only" on public.posts;
create policy "anon can insert posts only"
on public.posts
for insert
to anon, authenticated
with check (
  char_length(title) between 1 and 80
  and char_length(body) between 20 and 2000
  and (email is null or char_length(email) <= 254)
  and (reply_token_hash is null or char_length(reply_token_hash) = 64)
  and urgency in ('normal', 'soon', 'risky')
);
