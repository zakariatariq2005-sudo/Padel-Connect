# How to Check Browser Console

## Quick Method (Easiest)
**Press `F12` on your keyboard** - This opens Developer Tools in most browsers

## Step-by-Step Guide

### Chrome/Edge (Windows/Mac)
1. **Press `F12`** OR
2. **Right-click** anywhere on the page → Click **"Inspect"**
3. Click the **"Console"** tab at the top
4. You'll see messages, errors, and logs here

### Firefox
1. **Press `F12`** OR
2. **Right-click** → Click **"Inspect Element"**
3. Click the **"Console"** tab

### Safari (Mac)
1. First enable Developer menu:
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"
2. Then: **Develop** → **Show JavaScript Console**

## What You'll See

- **Red text** = Errors (these are problems!)
- **Yellow text** = Warnings
- **White/Blue text** = Normal log messages
- **"Session established, redirecting..."** = Good! Login is working

## For Your Login Issue

1. Open console (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for:
   - ✅ "Session established, redirecting..." = Working!
   - ❌ Red error messages = Problem (copy these!)
   - ❌ "Failed to establish session" = Session issue

## Quick Test
Type this in the console and press Enter:
```javascript
console.log('Hello!')
```
You should see "Hello!" appear - this confirms console is working!

