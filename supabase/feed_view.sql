create or replace view public.feed_posts as
select
  p.post_id as id,
  p.content,
  p.created_at,
  p.session_id,
  pr.author_id,
  pr.username as author_username,
  pr.avatar_color,
  (select count(*) from public.post_likes l where l.post_id = p.post_id) as like_count,
  (select count(*) from public.post_comments c where c.post_id = p.post_id) as comment_count
from (select id as post_id, content, created_at, session_id, user_id from public.posts) p
join (select id as author_id, username, avatar_color from public.profiles) pr
  on pr.author_id = p.user_id
order by p.created_at desc;
