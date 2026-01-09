# Quick Guide: Extract and Upload to GitHub

## 📦 Step 1: Extract the ZIP File

### Mac:
1. Double-click `Impero Sport-Complete.zip`
2. A folder named `Impero Sport-Complete` will appear
3. Rename it to `impero-sport` (optional, but cleaner)

### Windows:
1. Right-click `Impero Sport-Complete.zip`
2. Select "Extract All..."
3. Choose a location (Desktop is fine)
4. Click "Extract"

### Linux:
```bash
unzip Impero Sport-Complete.zip
cd Impero Sport-Complete
```

---

## 🚀 Step 2: Install Dependencies

Open terminal/command prompt in the extracted folder:

```bash
cd impero-sport  # or wherever you extracted it
npm install
```

Wait 2-5 minutes for packages to install.

---

## 📤 Step 3: Upload to GitHub

### Easiest Method: GitHub Desktop

1. **Download GitHub Desktop**: https://desktop.github.com
2. **Install and sign in** with your GitHub account
3. **Add the project**:
   - File → "Add Local Repository"
   - Click "Choose..." and select your `impero-sport` folder
   - Click "Add Repository"
4. **Publish**:
   - Click "Publish repository" button
   - Name: `impero-sport`
   - Description: "Padel player matching app"
   - Choose Public or Private
   - **UNCHECK** "Keep this code private" (if you want public)
   - Click "Publish Repository"

✅ Done! Your code is on GitHub.

---

### Alternative: Using Terminal

1. **Open terminal** in your `impero-sport` folder

2. **Run these commands**:

```bash
# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Impero Sport app"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/impero-sport.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

**Note**: When prompted for password, use a Personal Access Token:
- GitHub → Settings → Developer settings → Personal access tokens
- Generate new token with `repo` permission
- Use token as password

---

## ✅ Verify Upload

1. Go to https://github.com/YOUR_USERNAME/impero-sport
2. You should see all your files!
3. Check that these files exist:
   - `package.json`
   - `README.md`
   - `app/` folder
   - `components/` folder
   - All documentation files

---

## 🌐 Next: Deploy to Vercel

Once on GitHub, follow `DEPLOYMENT.md` to deploy to Vercel!

**Quick steps**:
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your repository
4. Add environment variables (Supabase credentials)
5. Deploy!

See `DEPLOYMENT.md` for detailed instructions.

---

## ❓ Need Help?

- **Full instructions**: See `PACKAGE_INSTRUCTIONS.md`
- **GitHub setup**: See `GITHUB_SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`


