#!/usr/bin/env node

/**
 * Migration script - outputs SQL to create the profiles table
 * Run with: npm run migrate
 */

const fs = require('fs')
const path = require('path')

// Read the migration SQL from the TypeScript file
// Since we can't directly import TS, we'll inline the SQL here
const migrationSQL = `
-- Create profiles table migration
-- Run this in your Supabase SQL Editor

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
`

// Check for command line arguments
const args = process.argv.slice(2)
const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1]
const saveToFile = args.includes('--save') || outputFile

if (saveToFile) {
  const filePath = outputFile || path.join(process.cwd(), 'migration.sql')
  fs.writeFileSync(filePath, migrationSQL.trim(), 'utf8')
  console.log(`✅ Migration SQL saved to: ${filePath}`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Open your Supabase project dashboard`)
  console.log(`   2. Go to SQL Editor`)
  console.log(`   3. Copy and paste the contents of ${filePath}`)
  console.log(`   4. Click "Run" to execute the migration\n`)
} else {
  console.log('='.repeat(80))
  console.log('📦 SUPABASE MIGRATION SQL')
  console.log('='.repeat(80))
  console.log('\nCopy and paste the following SQL into your Supabase SQL Editor:\n')
  console.log(migrationSQL.trim())
  console.log('\n' + '='.repeat(80))
  console.log('\n💡 Tip: Use "npm run migrate -- --save" to save to migration.sql file')
  console.log('   Or "npm run migrate -- --output=path/to/file.sql" to specify a custom path\n')
}

