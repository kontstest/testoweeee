-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Super admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Events policies
create policy "Super admins can do everything with events"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Clients can view their own events"
  on public.events for select
  using (client_id = auth.uid());

create policy "Clients can update their own events"
  on public.events for update
  using (client_id = auth.uid());

create policy "Guests can view events they're invited to"
  on public.events for select
  using (
    exists (
      select 1 from public.event_guests
      where event_id = events.id and guest_id = auth.uid()
    )
  );

-- Event guests policies
create policy "Super admins can manage event guests"
  on public.event_guests for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Clients can manage guests for their events"
  on public.event_guests for all
  using (
    exists (
      select 1 from public.events
      where id = event_guests.event_id and client_id = auth.uid()
    )
  );

-- Photos policies
create policy "Anyone can view photos for events they have access to"
  on public.photos for select
  using (
    exists (
      select 1 from public.events e
      left join public.event_guests eg on eg.event_id = e.id
      where e.id = photos.event_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Guests can upload photos to events they're invited to"
  on public.photos for insert
  with check (
    exists (
      select 1 from public.event_guests
      where event_id = photos.event_id and guest_id = auth.uid()
    )
  );

create policy "Users can delete their own photos"
  on public.photos for delete
  using (uploaded_by = auth.uid());

-- Schedule items policies
create policy "Anyone can view schedule for accessible events"
  on public.schedule_items for select
  using (
    exists (
      select 1 from public.events e
      left join public.event_guests eg on eg.event_id = e.id
      where e.id = schedule_items.event_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Clients can manage schedule for their events"
  on public.schedule_items for all
  using (
    exists (
      select 1 from public.events
      where id = schedule_items.event_id and client_id = auth.uid()
    )
  );

-- Menu items policies
create policy "Anyone can view menu for accessible events"
  on public.menu_items for select
  using (
    exists (
      select 1 from public.events e
      left join public.event_guests eg on eg.event_id = e.id
      where e.id = menu_items.event_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Clients can manage menu for their events"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.events
      where id = menu_items.event_id and client_id = auth.uid()
    )
  );

-- Surveys policies
create policy "Anyone can view surveys for accessible events"
  on public.surveys for select
  using (
    exists (
      select 1 from public.events e
      left join public.event_guests eg on eg.event_id = e.id
      where e.id = surveys.event_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Clients can manage surveys for their events"
  on public.surveys for all
  using (
    exists (
      select 1 from public.events
      where id = surveys.event_id and client_id = auth.uid()
    )
  );

-- Survey questions policies
create policy "Anyone can view questions for accessible surveys"
  on public.survey_questions for select
  using (
    exists (
      select 1 from public.surveys s
      join public.events e on e.id = s.event_id
      left join public.event_guests eg on eg.event_id = e.id
      where s.id = survey_questions.survey_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Clients can manage questions for their surveys"
  on public.survey_questions for all
  using (
    exists (
      select 1 from public.surveys s
      join public.events e on e.id = s.event_id
      where s.id = survey_questions.survey_id and e.client_id = auth.uid()
    )
  );

-- Survey responses policies
create policy "Guests can submit responses to accessible surveys"
  on public.survey_responses for insert
  with check (
    exists (
      select 1 from public.surveys s
      join public.events e on e.id = s.event_id
      join public.event_guests eg on eg.event_id = e.id
      where s.id = survey_responses.survey_id and eg.guest_id = auth.uid()
    )
  );

create policy "Clients can view responses for their surveys"
  on public.survey_responses for select
  using (
    exists (
      select 1 from public.surveys s
      join public.events e on e.id = s.event_id
      where s.id = survey_responses.survey_id and e.client_id = auth.uid()
    )
  );

-- Bingo cards policies
create policy "Anyone can view bingo cards for accessible events"
  on public.bingo_cards for select
  using (
    exists (
      select 1 from public.events e
      left join public.event_guests eg on eg.event_id = e.id
      where e.id = bingo_cards.event_id
      and (e.client_id = auth.uid() or eg.guest_id = auth.uid())
    )
  );

create policy "Clients can manage bingo cards for their events"
  on public.bingo_cards for all
  using (
    exists (
      select 1 from public.events
      where id = bingo_cards.event_id and client_id = auth.uid()
    )
  );

-- Bingo progress policies
create policy "Guests can view and update their own bingo progress"
  on public.bingo_progress for all
  using (guest_id = auth.uid());

create policy "Clients can view bingo progress for their events"
  on public.bingo_progress for select
  using (
    exists (
      select 1 from public.bingo_cards bc
      join public.events e on e.id = bc.event_id
      where bc.id = bingo_progress.bingo_card_id and e.client_id = auth.uid()
    )
  );
