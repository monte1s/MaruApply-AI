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

### 3. Set up Google OAuth (Optional)

To enable Google sign-in:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add redirect URL: Get your extension's redirect URL by running the extension and checking `chrome.identity.getRedirectURL()` in the console, or use: `https://[your-extension-id].chromiumapp.org/`
6. Add the same redirect URL to your Google Cloud Console OAuth 2.0 Client credentials

### 4. Run the development server

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
