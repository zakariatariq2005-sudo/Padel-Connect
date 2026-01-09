# Get Your Live Preview Link - Quick Guide

## 🚀 To Get a Live Preview Link

Your app needs to be deployed to get a live preview URL. Here's the fastest way:

### Option 1: Deploy to Vercel (5 Minutes - Recommended)

**This will give you a live URL like: `https://impero-sport.vercel.app`**

1. **Go to Vercel:**
   - Open: https://vercel.com/new
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

2. **Import Your Repository:**
   - You'll see: `zakariatariq2005-sudo/impero-sport`
   - Click "Import"

3. **Add Environment Variables:**
   - Scroll to "Environment Variables"
   - Add: `NEXT_PUBLIC_SUPABASE_URL` (your Supabase URL)
   - Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Supabase key)
   - Select all environments for both

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-5 minutes
   - You'll get your preview link! 🎉

**Your preview link will be:** `https://impero-sport-[hash].vercel.app` or `https://impero-sport.vercel.app`

---

### Option 2: View Static Preview (Design Only)

If you just want to see the design:

1. Open the file: `preview.html` in your browser
2. This shows the visual design (not functional)

**Location:** `/Users/zakariatariq/Desktop/dev/project/preview.html`

---

### Option 3: Run Locally (Full Functionality)

To run the full app on your computer:

1. **Install Node.js:** https://nodejs.org
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Supabase:** See `SUPABASE_SETUP.md`
4. **Create `.env.local`** with your credentials
5. **Run:**
   ```bash
   npm run dev
   ```
6. **Open:** http://localhost:3000

---

## ⚡ Quickest Way to Get a Live Link

**Deploy to Vercel - it's free and takes 5 minutes!**

Your repository is already on GitHub, so you just need to:
1. Connect it to Vercel
2. Add environment variables
3. Deploy
4. Get your preview link!

---

## 📋 What You Need

For Vercel deployment:
- ✅ GitHub account (you have this)
- ✅ Repository on GitHub (already done!)
- ⚠️ Supabase credentials (get from https://app.supabase.com)
- ⚠️ Vercel account (sign up at https://vercel.com)

---

**Ready to deploy?** Go to https://vercel.com/new and follow the steps above!

Your preview link will be ready in 5 minutes! 🚀

