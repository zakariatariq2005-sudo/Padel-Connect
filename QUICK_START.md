# Quick Start Guide - PadelConnect

Get your PadelConnect app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. **Create a Supabase account** (if you don't have one): https://supabase.com
2. **Create a new project** in Supabase
3. **Get your credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon/public key
4. **Create `.env.local` file** in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up Database

1. Open the **SQL Editor** in your Supabase dashboard
2. Copy and paste the SQL from `SUPABASE_SETUP.md` section by section:
   - Tables (players, match_requests, matches)
   - Row Level Security policies
   - Real-time enablement
   - Triggers (optional but recommended)
3. Run each SQL block

## Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 5: Test It Out

1. **Sign up** a new account with email/password
2. Open an **incognito window** and sign up a second account
3. In the first window, you should see the second player in your dashboard
4. Click **"Request Match"** on the second player
5. In the second window, accept the match request
6. Both windows should redirect to the live match page!

## Troubleshooting

### "Cannot find module '@supabase/ssr'"
Run `npm install` again to ensure all dependencies are installed.

### "Invalid API key" or connection errors
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes
- Restart your dev server after creating `.env.local`

### "relation does not exist" error
- Make sure you ran all the SQL setup scripts in Supabase
- Check that tables were created successfully in the Table Editor

### Real-time updates not working
- Go to Database → Replication in Supabase
- Enable replication for the `matches` table
- Refresh your browser

## Next Steps

- Read `CODE_EXPLANATION.md` to understand how the code works
- Check `README.md` for more detailed information
- Customize colors, fonts, or add new features!

## Deploy to Production

Ready to share your app with the world? 🚀

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete guide to:
- Setting up GitHub
- Deploying to Vercel
- Adding environment variables
- Setting up automatic deployments

Your app will be live on the internet in minutes!

## Need Help?

- Check the comments in the code files - they explain what each part does
- Read `CODE_EXPLANATION.md` for detailed explanations
- Review `SUPABASE_SETUP.md` for database setup details
- See `DEPLOYMENT.md` for deployment instructions
- See `GITHUB_SETUP.md` for GitHub setup help

