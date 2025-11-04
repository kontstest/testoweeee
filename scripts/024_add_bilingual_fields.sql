-- Add bilingual fields to survey tables
ALTER TABLE public.surveys
ADD COLUMN title_en text,
ADD COLUMN description_en text;

-- Add bilingual fields to survey_questions
ALTER TABLE public.survey_questions
ADD COLUMN question_text_en text,
ADD COLUMN options_en jsonb;

-- Add bilingual fields to menu_items
ALTER TABLE public.menu_items
ADD COLUMN name_en text,
ADD COLUMN description_en text;

-- Add bilingual fields to schedule_items
ALTER TABLE public.schedule_items
ADD COLUMN title_en text,
ADD COLUMN description_en text;

-- Add bilingual fields to bingo_cards (items are stored as jsonb with translations)
-- Note: bingo items are stored as array, we'll handle translations in the app

-- Add bilingual fields to vendors table
ALTER TABLE public.vendors
ADD COLUMN notes_en text;
