ALTER TABLE events ADD COLUMN guest_template VARCHAR(50) DEFAULT 'classic' CHECK (guest_template IN ('classic', 'elegant', 'colorful', 'minimal'));
