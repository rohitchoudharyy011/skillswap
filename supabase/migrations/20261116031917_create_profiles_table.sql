/*
# Create member profiles

1. New Tables
- `profiles`: one row per member, linked to their sign-in account.
  - `id` (uuid, primary key, same as the account id)
  - `name` (2-60 characters)
  - `bio` (up to 500 characters)
  - `location` (city or area, up to 80 characters)
  - `skills_offered` (list of lowercase skill tags, up to 15)
  - `skills_wanted` (list of lowercase skill tags, up to 15)
  - `created_at`, `updated_at`

2. Automation
- A trigger creates a profile automatically when a new account is registered, using the name entered at sign-up.
- A trigger keeps `updated_at` current on every change.

3. Security
- Row level security enabled.
- Signed-in members can read all profiles (needed for discovery and public profile pages). No email addresses are stored here.
- Members can only update their own profile, and only the editable columns (no insert or delete grants).

4. Indexes
- GIN indexes on both skill lists for fast overlap searches.
- Index on lower-cased location for city filtering.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
  location text NOT NULL DEFAULT '' CHECK (char_length(location) <= 80),
  skills_offered text[] NOT NULL DEFAULT '{}' CHECK (cardinality(skills_offered) <= 15),
  skills_wanted text[] NOT NULL DEFAULT '{}' CHECK (cardinality(skills_wanted) <= 15),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_skills_offered_idx ON profiles USING GIN (skills_offered);
CREATE INDEX IF NOT EXISTS profiles_skills_wanted_idx ON profiles USING GIN (skills_wanted);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles (lower(location));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (name, bio, location, skills_offered, skills_wanted, updated_at) ON profiles TO authenticated;

DROP POLICY IF EXISTS "members_read_profiles" ON profiles;
CREATE POLICY "members_read_profiles" ON profiles FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION handle_new_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    left(coalesce(nullif(trim(NEW.raw_user_meta_data->>'name'), ''), 'New member'), 60)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_account() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_account_created ON auth.users;
CREATE TRIGGER on_auth_account_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_account();
