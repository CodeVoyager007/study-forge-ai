create table public.push_subscriptions (
  user_id uuid not null,
  subscription jsonb not null,
  primary key (user_id),
  foreign key (user_id) references auth.users (id)
);
