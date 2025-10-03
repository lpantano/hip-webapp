# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ce017a26-619d-424c-9f9d-57352e8d9493

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ce017a26-619d-424c-9f9d-57352e8d9493) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ce017a26-619d-424c-9f9d-57352e8d9493) and click on Share -> Publish.

## Authentication Setup

This project includes a complete authentication system with Google OAuth and email/password login. To set it up properly:

### 1. Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. Choose **Web application** as the application type
6. Add your authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - Your production domain (e.g., `https://your-domain.com`)
7. Add your authorized redirect URIs:
   - `https://stbumtfkanunkgopitfd.supabase.co/auth/v1/callback`
8. Copy the **Client ID** and **Client Secret**

### 2. Configure Supabase Authentication

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/stbumtfkanunkgopitfd)
2. Go to **Authentication > Providers**
3. Enable **Google** provider and paste your Client ID and Client Secret
4. Go to **Authentication > URL Configuration**
5. Set your **Site URL** to your production domain (e.g., `https://your-domain.com`)
6. Add **Redirect URLs**:
   - `http://localhost:5173` (for local development)
   - Your production domain (e.g., `https://your-domain.com`)

### 3. Fix Security Warning (Production)

To resolve the OTP expiry security warning for production:

1. Go to **Authentication > Settings** in your Supabase dashboard
2. Under **Security Settings**, set **OTP expiry** to a reasonable value (e.g., 3600 seconds for 1 hour)
3. This prevents potential security issues with long-lived OTP tokens

### 4. Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/auth` to test the login/signup flows
3. Try both email/password and Google OAuth (if configured)

### Authentication Features

- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Automatic user profile creation
- ✅ Role-based access control
- ✅ Secure session management
- ✅ Email confirmation (can be disabled in Supabase settings for testing)

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Exporting the database schema from Supabase into database.sql

If you want the project to contain an up-to-date copy of your Supabase database schema (tables, views, types, functions, constraints), follow these steps to export the schema and save it into the repository's `database.sql` file.

There are two common approaches: using the Supabase dashboard to obtain connection details and running `pg_dump` locally (recommended), or using a Supabase backup/export if you prefer the web UI.

A. Using the Supabase CLI (recommended)

1. No install required — run the CLI via npx. First authenticate with Supabase:

   zsh
   ```sh
   # This opens a browser to authenticate the CLI with your account
   npx supabase login
   ```

   If you prefer a non-interactive flow, create a Personal Access Token in the Supabase dashboard and set it in your environment:

   ```sh
   export SUPABASE_ACCESS_TOKEN="your_personal_access_token"
   ```

2. Link the local project to your Supabase project (use the project ref from your Supabase dashboard):

   zsh
   ```sh
   # Replace <PROJECT_REF> with the value shown in your Supabase project settings (e.g. stbumt...)
   npx supabase link --project-ref <PROJECT_REF>
   ```

3. Export the schema only to `database.sql`:

   zsh
   ```sh
   # Dumps schema-only (no data) to database.sql
   npx supabase db dump --file database.sql
   ```

   Notes:
   - The CLI will use the linked project's connection info. If you need to override the connection, set `SUPABASE_DB_URL` to a full Postgres URI before running the command.

4. Verify and commit:

   ```sh
   git add database.sql
   git commit -m "chore(db): export schema from Supabase via CLI"
   git push
   ```


B. Using the Supabase Dashboard (UI)

Some projects prefer to use the dashboard backup/export features. You can explore:

- Project Settings -> Backups / Export: create or download a backup. This may provide a full dump including data; you can extract schema-only as needed.
- SQL Editor: copy DDL from the editor if you maintain migration scripts there.

C. Security notes

- Avoid committing connection credentials. Use the dashboard to copy values only for running the export locally, or use CI secrets when automating.
- For CI-driven exports, store the Supabase connection URI as a secret (e.g., `SUPABASE_DB_URL`) and run `pg_dump` in the pipeline, then commit or upload the artifact to a release.

If you'd like I can add a short script in `scripts/export-schema.sh` that wraps the `pg_dump` command and uses environment variables for the connection details. Tell me if you want that and I will add it.
