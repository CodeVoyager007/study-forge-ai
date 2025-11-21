create table public.user_preferences (
  user_id uuid not null,
  reminders_enabled boolean not null default false,
  primary key (user_id),
  foreign key (user_id) references auth.users (id)
);
