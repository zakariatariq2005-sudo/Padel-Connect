# Deployment Checklist

Use this checklist to ensure your PadelConnect app is ready for deployment.

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All files saved
- [ ] Code tested locally (`npm run dev` works)
- [ ] No console errors in browser
- [ ] Authentication works (can sign up and log in)
- [ ] Database connection works (can see players in dashboard)

### ✅ Supabase Setup
- [ ] Supabase project created
- [ ] All tables created (players, match_requests, matches)
- [ ] Row Level Security policies set up
- [ ] Real-time enabled for `matches` table
- [ ] Supabase credentials copied (URL and anon key)

### ✅ Git & GitHub
- [ ] Git initialized (`git init`)
- [ ] First commit created (`git commit -m "Initial commit"`)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub (`git push`)
- [ ] Can see all files on GitHub

### ✅ Environment Variables Prepared
- [ ] `NEXT_PUBLIC_SUPABASE_URL` value ready
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` value ready
- [ ] Values saved in a safe place (not in code!)

## Deployment Checklist

### ✅ Vercel Setup
- [ ] Vercel account created
- [ ] Signed in to Vercel
- [ ] GitHub account connected to Vercel
- [ ] Project imported from GitHub

### ✅ Environment Variables in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
  - [ ] Value is correct (no extra spaces)
  - [ ] All environments selected (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel
  - [ ] Value is correct (no extra spaces)
  - [ ] All environments selected (Production, Preview, Development)

### ✅ Deployment
- [ ] Initial deployment completed
- [ ] App redeployed after adding environment variables
- [ ] Deployment status shows "Ready" (green checkmark)
- [ ] Deployment URL works (clickable link)

## Post-Deployment Testing

### ✅ Functionality Tests
- [ ] Can access the deployed URL
- [ ] Sign up page loads
- [ ] Can create a new account
- [ ] Can log in with created account
- [ ] Dashboard loads after login
- [ ] Can see other players (if any)
- [ ] Match request functionality works
- [ ] Real-time updates work (if testing with two users)

### ✅ Security Checks
- [ ] Cannot access `/dashboard` without logging in (redirects to login)
- [ ] Cannot access `/match/[id]` if not a participant
- [ ] Environment variables not exposed in browser (check page source)
- [ ] `.env.local` file NOT committed to GitHub (check repository)

## Troubleshooting Checklist

If something doesn't work:

### Build Fails
- [ ] Check build logs in Vercel
- [ ] Verify environment variables are set
- [ ] Check for syntax errors in code
- [ ] Ensure `package.json` has all dependencies

### App Works Locally but Not on Vercel
- [ ] Environment variables added to Vercel?
- [ ] Environment variables have correct values?
- [ ] App redeployed after adding variables?
- [ ] Supabase database tables created?
- [ ] Supabase RLS policies configured?

### Authentication Issues
- [ ] Supabase project is active (not paused)
- [ ] Supabase URL and key are correct
- [ ] Email confirmations disabled (for testing) or configured properly
- [ ] Check browser console for errors

### Database Connection Issues
- [ ] Supabase project is active
- [ ] Tables exist in Supabase
- [ ] RLS policies allow access
- [ ] Check Supabase logs for errors

## Success Criteria

Your deployment is successful when:
- ✅ App is accessible via Vercel URL
- ✅ Users can sign up and log in
- ✅ Dashboard shows online players
- ✅ Match requests work
- ✅ Real-time updates work
- ✅ No errors in browser console
- ✅ No errors in Vercel build logs

## Next Steps After Successful Deployment

- [ ] Share your app URL with friends/testers
- [ ] Monitor Vercel analytics
- [ ] Set up custom domain (optional)
- [ ] Configure email templates in Supabase (optional)
- [ ] Add more features and push updates!

---

## Quick Reference

**GitHub Repository**: `https://github.com/YOUR_USERNAME/padelconnect`

**Vercel Dashboard**: `https://vercel.com/dashboard`

**Supabase Dashboard**: `https://app.supabase.com`

**Your Live App**: `https://YOUR_PROJECT.vercel.app` (shown in Vercel dashboard)

---

## Need Help?

- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub Setup**: See [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Supabase Setup**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Code Explanation**: See [CODE_EXPLANATION.md](./CODE_EXPLANATION.md)


