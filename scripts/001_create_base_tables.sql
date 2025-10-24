-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('super_admin', 'client', 'guest');

-- Create enum for event status
create type event_status as enum ('draft', 'active', 'completed', 'archived');

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'guest',
  first_name text,
  last_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  event_date date not null,
  status event_status not null default 'draft',
  client_id uuid references public.profiles(id) on delete cascade,
  qr_code text,
  
  -- Customization options
  primary_color text default '#8B5CF6',
  secondary_color text default '#EC4899',
  hero_image_url text,
  
  -- Module flags
  module_photo_gallery boolean default false,
  module_schedule boolean default false,
  module_menu boolean default false,
  module_survey boolean default false,
  module_bingo boolean default false,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create event_guests table (many-to-many relationship)
create table if not exists public.event_guests (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(event_id, guest_id)
);

-- Create photos table
create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  image_url text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- Create schedule_items table
create table if not exists public.schedule_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  time time not null,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Create menu_items table
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  category text not null, -- 'appetizer', 'main', 'dessert', 'drink'
  name text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Create surveys table
create table if not exists public.surveys (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create survey_questions table
create table if not exists public.survey_questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid references public.surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null, -- 'multiple_choice', 'text', 'rating'
  options jsonb, -- For multiple choice options
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Create survey_responses table
create table if not exists public.survey_responses (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid references public.surveys(id) on delete cascade,
  question_id uuid references public.survey_questions(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  response_text text,
  created_at timestamp with time zone default now()
);

-- Create bingo_cards table
create table if not exists public.bingo_cards (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  items jsonb not null, -- Array of bingo items
  created_at timestamp with time zone default now()
);

-- Create bingo_progress table (tracks guest progress)
create table if not exists public.bingo_progress (
  id uuid primary key default uuid_generate_v4(),
  bingo_card_id uuid references public.bingo_cards(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete cascade,
  completed_items jsonb default '[]'::jsonb,
  is_winner boolean default false,
  created_at timestamp with time zone default now(),
  unique(bingo_card_id, guest_id)
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_guests enable row level security;
alter table public.photos enable row level security;
alter table public.schedule_items enable row level security;
alter table public.menu_items enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.bingo_cards enable row level security;
alter table public.bingo_progress enable row level security;
