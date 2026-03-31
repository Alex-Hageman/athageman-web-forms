-- Fast Food Favorites Survey — Supabase Setup SQL
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)

-- 1. Create the survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now()             NOT NULL,
  favorite_chain text     NOT NULL,
  region      text        NOT NULL,
  frequency   text        NOT NULL,
  factors     text[]      NOT NULL,
  other_factor text
);

-- 2. Enable Row Level Security (required for public access without auth)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to INSERT a new response (submit the survey)
CREATE POLICY "Public can insert survey responses"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Allow anyone to SELECT aggregated data (read the results page)
CREATE POLICY "Public can read survey responses"
  ON survey_responses
  FOR SELECT
  TO anon
  USING (true);
