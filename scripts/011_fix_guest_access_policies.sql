-- Drop existing restrictive policies for guest-accessible data
drop policy if exists "Anyone can view schedule for accessible events" on public.schedule_items;
drop policy if exists "Anyone can view menu for accessible events" on public.menu_items;
drop policy if exists "Anyone can view surveys for accessible events" on public.surveys;
drop policy if exists "Anyone can view questions for accessible surveys" on public.survey_questions;
drop policy if exists "Anyone can view bingo cards for accessible events" on public.bingo_cards;
drop policy if exists "Anyone can view photos for events they have access to" on public.photos;
drop policy if exists "Guests can view events they're invited to" on public.events;

-- Allow public read access to events (guests don't need to log in)
create policy "Anyone can view events"
  on public.events for select
  using (true);

-- Allow public read access to schedule items
create policy "Anyone can view schedule items"
  on public.schedule_items for select
  using (true);

-- Allow public read access to menu items
create policy "Anyone can view menu items"
  on public.menu_items for select
  using (true);

-- Allow public read access to surveys
create policy "Anyone can view surveys"
  on public.surveys for select
  using (true);

-- Allow public read access to survey questions
create policy "Anyone can view survey questions"
  on public.survey_questions for select
  using (true);

-- Allow public read access to bingo cards
create policy "Anyone can view bingo cards"
  on public.bingo_cards for select
  using (true);

-- Allow public read access to photos
create policy "Anyone can view photos"
  on public.photos for select
  using (true);

-- Allow anonymous users to submit survey responses
drop policy if exists "Guests can submit responses to accessible surveys" on public.survey_responses;
create policy "Anyone can submit survey responses"
  on public.survey_responses for insert
  with check (true);

-- Allow anonymous users to create and manage their bingo progress
drop policy if exists "Guests can view and update their own bingo progress" on public.bingo_progress;
create policy "Anyone can manage bingo progress"
  on public.bingo_progress for all
  using (true);
