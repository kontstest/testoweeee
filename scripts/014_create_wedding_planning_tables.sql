-- Create wedding budget table
CREATE TABLE IF NOT EXISTS wedding_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  total_budget DECIMAL(10, 2) DEFAULT 0,
  spent DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wedding expenses table
CREATE TABLE IF NOT EXISTS wedding_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  actual_cost DECIMAL(10, 2) DEFAULT 0,
  paid DECIMAL(10, 2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wedding checklist table
CREATE TABLE IF NOT EXISTS wedding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  task TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wedding_budget_event_id ON wedding_budget(event_id);
CREATE INDEX IF NOT EXISTS idx_wedding_expenses_event_id ON wedding_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_wedding_checklist_event_id ON wedding_checklist(event_id);

-- Enable RLS
ALTER TABLE wedding_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can manage their wedding budget"
  ON wedding_budget FOR ALL
  USING (event_id IN (SELECT id FROM events WHERE client_id = auth.uid()));

CREATE POLICY "Clients can manage their wedding expenses"
  ON wedding_expenses FOR ALL
  USING (event_id IN (SELECT id FROM events WHERE client_id = auth.uid()));

CREATE POLICY "Clients can manage their wedding checklist"
  ON wedding_checklist FOR ALL
  USING (event_id IN (SELECT id FROM events WHERE client_id = auth.uid()));

-- Super admins can manage all
CREATE POLICY "Super admins can manage all wedding budgets"
  ON wedding_budget FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage all wedding expenses"
  ON wedding_expenses FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage all wedding checklists"
  ON wedding_checklist FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Insert default checklist items for new weddings
CREATE OR REPLACE FUNCTION create_default_wedding_checklist()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'wedding' THEN
    INSERT INTO wedding_checklist (event_id, category, task, description, priority, order_index) VALUES
    (NEW.id, '12+ miesięcy przed', 'Ustal budżet wesela', 'Określ ile możecie przeznaczyć na wesele', 'high', 1),
    (NEW.id, '12+ miesięcy przed', 'Wybierz datę wesela', 'Wybierz kilka możliwych terminów', 'high', 2),
    (NEW.id, '12+ miesięcy przed', 'Zarezerwuj salę weselną', 'Odwiedź kilka sal i wybierz najlepszą', 'high', 3),
    (NEW.id, '12+ miesięcy przed', 'Wybierz fotografa', 'Sprawdź portfolio i umów się na spotkanie', 'high', 4),
    (NEW.id, '12+ miesięcy przed', 'Wybierz kamerzysta', 'Film z wesela to wspaniała pamiątka', 'medium', 5),
    (NEW.id, '9-12 miesięcy przed', 'Wybierz zespół/DJ', 'Muzyka to podstawa dobrej zabawy', 'high', 6),
    (NEW.id, '9-12 miesięcy przed', 'Zarezerwuj kościół', 'Jeśli planujesz ślub kościelny', 'high', 7),
    (NEW.id, '9-12 miesięcy przed', 'Wybierz catering', 'Degustacja menu to świetna zabawa', 'high', 8),
    (NEW.id, '6-9 miesięcy przed', 'Zamów suknię ślubną', 'Pamiętaj o czasie na przymiarki', 'high', 9),
    (NEW.id, '6-9 miesięcy przed', 'Zamów garnitur', 'Dla Pana Młodego i świadków', 'medium', 10),
    (NEW.id, '6-9 miesięcy przed', 'Wybierz kwiaciarnie', 'Bukiet, dekoracje sali i kościoła', 'medium', 11),
    (NEW.id, '6-9 miesięcy przed', 'Zarezerwuj tort weselny', 'Degustacja tortów to przyjemność', 'medium', 12),
    (NEW.id, '3-6 miesięcy przed', 'Wyślij zaproszenia', 'Daj gościom czas na zaplanowanie', 'high', 13),
    (NEW.id, '3-6 miesięcy przed', 'Zarezerwuj hotel dla gości', 'Jeśli przyjadą z daleka', 'medium', 14),
    (NEW.id, '3-6 miesięcy przed', 'Zaplanuj podróż poślubną', 'Zasłużony odpoczynek po weselu', 'low', 15),
    (NEW.id, '1-3 miesiące przed', 'Finalne przymiarki', 'Suknia i garnitur muszą idealnie pasować', 'high', 16),
    (NEW.id, '1-3 miesiące przed', 'Zarezerwuj fryzjera i makijaż', 'Na dzień ślubu', 'medium', 17),
    (NEW.id, '1-3 miesiące przed', 'Zaplanuj dekoracje', 'Kwiaty, świece, ozdoby', 'medium', 18),
    (NEW.id, '1 miesiąc przed', 'Potwierdź wszystkie rezerwacje', 'Sala, catering, zespół, fotograf', 'high', 19),
    (NEW.id, '1 miesiąc przed', 'Przygotuj plan stołów', 'Kto gdzie będzie siedział', 'medium', 20),
    (NEW.id, '2 tygodnie przed', 'Próba generalna', 'W kościele lub USC', 'medium', 21),
    (NEW.id, '1 tydzień przed', 'Przygotuj mowę', 'Jeśli planujesz przemówienie', 'low', 22),
    (NEW.id, '1 tydzień przed', 'Spakuj się na podróż poślubną', 'Żeby nie zapomnieć w ostatniej chwili', 'low', 23);

    INSERT INTO wedding_budget (event_id, total_budget) VALUES (NEW.id, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wedding_checklist_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wedding_checklist();
