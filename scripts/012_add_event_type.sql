-- Add event_type column to events table
alter table public.events
add column event_type text not null default 'wedding' check (event_type in ('wedding', 'event'));

-- Add comment
comment on column public.events.event_type is 'Type of event: wedding or general event';
