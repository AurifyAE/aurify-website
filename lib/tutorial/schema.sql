-- Client tutorial access. Run once in the Neon SQL editor.
-- All times are timestamptz (UTC); the app shows them in Gulf time.

create table allowed_users (
  email text primary key,
  name text,
  active boolean not null default true,
  access_days int not null default 14,
  access_started_at timestamptz,
  access_expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table devices (
  id serial primary key,
  email text not null references allowed_users(email) on delete cascade,
  device_hash text not null,
  label text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  removed boolean not null default false
);
create unique index devices_active_uniq on devices(email, device_hash) where not removed;

create table sessions (
  id serial primary key,
  token_hash text not null unique,
  email text not null references allowed_users(email) on delete cascade,
  device_id int not null references devices(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  expires_at timestamptz not null,
  ended boolean not null default false
);
create index sessions_active_idx on sessions(email) where not ended;

create table login_codes (
  id serial primary key,
  email text not null,
  code_hash text not null,
  device_hash text not null,
  expires_at timestamptz not null,
  wrong_attempts int not null default 0,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index login_codes_email_idx on login_codes(email, created_at);

create table activity_log (
  id serial primary key,
  at timestamptz not null default now(),
  email text,
  action text not null,
  ip text,
  user_agent text,
  details jsonb
);
create index activity_log_email_idx on activity_log(email, at);
create index activity_log_ip_idx on activity_log(ip, action, at);

-- Admins are listed in ADMIN_EMAILS, not allowed_users, so their sessions live apart.
create table admin_sessions (
  id serial primary key,
  token_hash text not null unique,
  email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended boolean not null default false
);
