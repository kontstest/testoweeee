-- Fix RLS policy for survey_responses to allow anonymous guests to submit responses

-- Drop existing restrictive policy
drop policy if exists "Guests can submit responses to accessible surveys" on public.survey_responses;
drop policy if exists "Anyone can submit survey responses" on public.survey_responses;

-- Allow anonymous users (guests) to submit survey responses without authentication
create policy "Anonymous guests can submit survey responses"
  on public.survey_responses for insert
  with check (true);

-- Keep the existing policy for clients to view responses
-- (no changes needed for SELECT policy)
