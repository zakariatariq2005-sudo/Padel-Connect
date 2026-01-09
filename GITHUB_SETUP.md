# GitHub Repository Setup - Quick Guide

This is a simple guide to get your code on GitHub so you can deploy to Vercel.

## Why GitHub?

GitHub is like "Google Drive for code." It stores your code online and makes it easy to:
- Back up your code
- Share it with others
- Deploy to services like Vercel
- Track changes over time

## Step-by-Step Setup

### Step 1: Install Git (if you haven't already)

**Mac/Linux**: Usually pre-installed. Check by running:
```bash
git --version
```

If not installed:
- **Mac**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

**Windows**: Download from https://git-scm.com/download/win

### Step 2: Configure Git (first time only)

Tell Git who you are:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Use the same email you'll use for GitHub!

### Step 3: Initialize Git in Your Project

Open your terminal in the project folder and run:

```bash
# Navigate to your project folder
cd /Users/zakariatariq/Desktop/dev/project

# Initialize Git
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Impero Sport app"
```

**What each command does:**
- `git init`: Starts tracking your project with Git
- `git add .`: Stages all files to be saved
- `git commit -m "message"`: Saves a snapshot with a message

### Step 4: Create GitHub Repository

1. Go to https://github.com and sign in (create account if needed)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Name**: `impero-sport` (or any name)
   - **Description**: "Padel player matching app"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

### Step 5: Connect Local Code to GitHub

GitHub will show you commands. Use the "push an existing repository" option:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/impero-sport.git

# Rename branch to 'main' (GitHub's default)
git branch -M main

# Upload your code
git push -u origin main
```

**Authentication Options:**

**Option A: Personal Access Token (Recommended)**
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scope: `repo` (full control of private repositories)
4. Copy the token
5. Use the token as your password when pushing

**Option B: SSH Key (Advanced)**
- More secure but requires setup
- See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Step 6: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files!
3. Click on files to view them online

## What's Next?

Now that your code is on GitHub, you can:
1. **Deploy to Vercel** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Make changes** - Edit files, commit, and push updates
3. **Collaborate** - Share your repository with others

## Common Commands

Once set up, here are commands you'll use regularly:

```bash
# Check status of your files
git status

# See what changed
git diff

# Add changed files
git add .

# Save changes with a message
git commit -m "Description of your changes"

# Upload to GitHub
git push

# Download latest changes (if working with others)
git pull
```

## Troubleshooting

### "fatal: not a git repository"

**Solution**: Make sure you're in the project folder and run `git init`

### "remote origin already exists"

**Solution**: The repository is already connected. Just run `git push -u origin main`

### "Authentication failed"

**Solution**: 
- Make sure you're using a Personal Access Token (not your password)
- Check that the token has `repo` permissions
- Verify your GitHub username is correct

### "Permission denied"

**Solution**:
- Check your GitHub username is correct in the remote URL
- Make sure you have access to the repository
- Try using a Personal Access Token instead of password

## Security Reminder

**Never commit sensitive information!**

Your `.gitignore` file already protects:
- `.env.local` files (contains your Supabase keys)
- `node_modules/` folder
- Other sensitive files

**Important**: If you accidentally commit secrets:
1. Remove them from Git history (advanced)
2. Regenerate your Supabase keys
3. Update keys in Vercel environment variables

## Need Help?

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **GitHub Support**: https://support.github.com


