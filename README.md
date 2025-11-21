This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

### 1. Set up Supabase Authentication

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key
5. Create a `.env` file in the root directory (copy from `.env.example`)
6. Add your Supabase credentials:

```env
PLASMO_PUBLIC_SUPABASE_URL=your-supabase-project-url
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
PLASMO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

### 2. Set up OpenAI API (Required for Resume Analysis)

1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `PLASMO_PUBLIC_OPENAI_API_KEY`
3. The Profile page uses OpenAI to analyze resumes and extract personal information

### 3. Set up Database Tables

You need to create the `profiles` table in your Supabase database before using the extension.

**Quick way:** Run the migrate command to get the SQL:

```bash
npm run migrate
# or to save to a file:
npm run migrate -- --save
```

Then:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL (or open the saved `migration.sql` file)
4. Click "Run" to execute

**Manual way:** Run the following migration SQL directly in Supabase SQL Editor:

```sql
-- Create profiles table migration
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on profile_data for JSON queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_data ON profiles USING GIN (profile_data);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);
```

**Note:** The extension will automatically check for the table on startup. If it doesn't exist, check the browser console for migration instructions.

### 4. Set up Google OAuth (Optional)

To enable Google sign-in:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add redirect URL: Get your extension's redirect URL by running the extension and checking `chrome.identity.getRedirectURL()` in the console, or use: `https://[your-extension-id].chromiumapp.org/`
6. Add the same redirect URL to your Google Cloud Console OAuth 2.0 Client credentials

### 5. Run the development server

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
