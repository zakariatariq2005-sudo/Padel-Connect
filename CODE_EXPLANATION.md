# Code Explanation - PadelConnect

This document explains all the code in the PadelConnect application in simple terms, making it easy to understand how everything works.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Configuration Files](#configuration-files)
3. [Supabase Setup](#supabase-setup)
4. [Authentication](#authentication)
5. [Pages](#pages)
6. [Components](#components)
7. [Security](#security)
8. [Real-time Updates](#real-time-updates)

---

## Project Structure

### What is Next.js?

Next.js is a React framework that makes building web applications easier. It provides:
- **Server Components**: Components that run on the server (faster, more secure)
- **Client Components**: Components that run in the browser (interactive)
- **File-based routing**: Create a file in the `app` folder, and it becomes a page
- **Built-in optimizations**: Automatic code splitting, image optimization, etc.

### The `app` Directory

In Next.js 13+, the `app` directory is where all your pages and layouts live:
- `app/page.tsx` = Home page (the `/` route)
- `app/login/page.tsx` = Login page (the `/login` route)
- `app/dashboard/page.tsx` = Dashboard page (the `/dashboard` route)
- `app/match/[id]/page.tsx` = Dynamic route for matches (the `/match/123` route)

---

## Configuration Files

### `package.json`

This file lists all the dependencies (libraries) your app needs:
- `next`, `react`, `react-dom`: The core framework
- `@supabase/supabase-js`, `@supabase/ssr`: For authentication and database
- `tailwindcss`: For styling
- `typescript`: For type safety

### `tailwind.config.ts`

This configures Tailwind CSS (our styling framework):
- **Colors**: Defines our brand colors (primary blue, secondary green, etc.)
- **Fonts**: Sets Montserrat for headings, Inter for body text
- **Content paths**: Tells Tailwind which files to scan for class names

**In simple terms**: This file customizes how our app looks and what colors/fonts we use.

### `tsconfig.json`

TypeScript configuration. TypeScript adds type checking to JavaScript, which helps catch errors before running the code.

---

## Supabase Setup

### What is Supabase?

Supabase is like Firebase but open-source. It provides:
- **Authentication**: Login/signup functionality
- **Database**: PostgreSQL database (like Excel, but much more powerful)
- **Real-time**: Automatically syncs data changes across all connected clients

### `lib/supabase/client.ts`

**Purpose**: Creates a Supabase client for use in the browser.

**How it works**:
1. Takes your Supabase URL and API key from environment variables
2. Creates a client that can talk to Supabase
3. This client is used in Client Components (components that run in the browser)

**Example**: When you click a button to send a match request, this client sends the request to Supabase.

### `lib/supabase/server.ts`

**Purpose**: Creates a Supabase client for use on the server.

**Key difference**: This version can read/write cookies, which is important for authentication. When you log in, your session is stored in cookies, and the server needs to read these cookies to know who you are.

**How it works**:
1. Reads authentication cookies from the request
2. Creates a Supabase client that includes your session
3. This client is used in Server Components and API routes

---

## Authentication

### `lib/auth.ts`

This file provides helper functions for authentication:

#### `getUser()`
- **What it does**: Checks if someone is logged in
- **Returns**: The user object if logged in, `null` if not
- **Use case**: "Show different content if user is logged in"

#### `requireAuth()`
- **What it does**: Ensures the user is logged in
- **If not logged in**: Automatically redirects to `/login`
- **Returns**: The user object (guaranteed to exist)
- **Use case**: Protect pages that only logged-in users should see

#### `getUserProfile()`
- **What it does**: Gets the player profile from the database
- **How it works**: 
  1. First calls `requireAuth()` to ensure user is logged in
  2. Looks up the player profile in the `players` table
  3. If no profile exists, creates one automatically
- **Returns**: The player profile (name, skill level, location, etc.)

### `app/login/page.tsx`

**Type**: Client Component (has `'use client'` at the top)

**What it does**:
1. Shows a login form (email and password fields)
2. When submitted, calls `supabase.auth.signInWithPassword()`
3. If successful, updates the player's online status and redirects to dashboard
4. If failed, shows an error message

**Key concepts**:
- `useState`: Stores form data (email, password) and error messages
- `useRouter`: Used to navigate to different pages
- `createClient()`: Creates a Supabase client to authenticate

### `app/signup/page.tsx`

Similar to login page, but:
1. Collects more information (name, skill level, location)
2. Creates a new user account with `supabase.auth.signUp()`
3. Creates a player profile in the database
4. Redirects to dashboard

---

## Pages

### `app/page.tsx` (Home Page)

**Type**: Server Component

**What it does**: Simple redirect logic
- If user is logged in → go to `/dashboard`
- If user is not logged in → go to `/login`

**Why Server Component?**: It doesn't need interactivity, and checking auth on the server is faster.

### `app/dashboard/page.tsx`

**Type**: Server Component

**What it does**:
1. Uses `requireAuth()` to ensure user is logged in
2. Gets the user's profile
3. Fetches all online players (except the current user)
4. Fetches match requests (incoming and outgoing)
5. Displays everything using child components

**Why Server Component?**: 
- Fetches data on the server (faster, more secure)
- No need for loading states (data is ready when page renders)
- Better SEO (search engines can see the content)

**Child Components**:
- `PlayerList`: Shows the list of online players
- `MatchRequestsSection`: Shows match requests (handled within the same file)

### `app/match/[id]/page.tsx`

**Type**: Server Component

**What it does**:
1. Gets the match ID from the URL (the `[id]` part)
2. Fetches the match data from the database
3. **Security check**: Verifies the current user is one of the match participants
4. If not authorized, redirects to dashboard
5. Passes data to `LiveMatchClient` component for real-time updates

**Dynamic Routes**: The `[id]` folder name means this is a dynamic route. `/match/123` and `/match/456` both use this same page, but with different IDs.

---

## Components

### `components/LogoutButton.tsx`

**Type**: Client Component

**What it does**:
1. When clicked, updates the player's online status to `false`
2. Signs the user out of Supabase
3. Redirects to the login page

**Why Client Component?**: Needs to handle button clicks (user interaction).

### `components/PlayerList.tsx`

**Type**: Client Component

**What it does**:
1. Receives a list of players as props
2. Displays each player in a card with their info
3. Each card has a "Request Match" button
4. When clicked, creates a match request in the database

**Key concepts**:
- `useState`: Tracks which player's request is being sent (for loading state)
- `props`: Data passed from parent component
- `router.refresh()`: Refreshes the page data after creating a request

### `components/MatchRequestActions.tsx`

**Type**: Client Component

**What it does**: Provides Accept/Reject buttons for incoming match requests

**Accept flow**:
1. Updates the match request status to "accepted"
2. Creates a new match record
3. Redirects both players to the live match page

**Reject flow**:
1. Updates the match request status to "rejected"
2. Refreshes the page to remove it from the list

### `components/LiveMatchClient.tsx`

**Type**: Client Component

**What it does**: Displays live match information with real-time updates

**How real-time works**:
1. Uses `useEffect` to set up a subscription when component loads
2. Subscribes to changes on the `matches` table for this specific match
3. When the match status changes, Supabase sends an update
4. The component receives the update and re-renders automatically

**Key concepts**:
- `useEffect`: Runs code when component mounts (loads)
- `supabase.channel()`: Creates a real-time channel
- `.subscribe()`: Starts listening for changes
- Cleanup function: Unsubscribes when component unmounts (prevents memory leaks)

**Status colors**:
- Waiting = Yellow
- In Progress = Green
- Finished = Gray

---

## Security

### `middleware.ts`

**What is middleware?**: Code that runs on every request before the page loads.

**What it does**:
1. Refreshes the user's authentication session if needed
2. Checks if the requested route requires authentication
3. Redirects unauthenticated users away from protected routes
4. Redirects authenticated users away from login/signup pages

**Protected routes**: `/dashboard` and `/match/*`
- If not logged in → redirect to `/login`

**Auth routes**: `/login` and `/signup`
- If already logged in → redirect to `/dashboard`

**Why it's important**: Provides an extra layer of security at the edge (before any page code runs).

### Row Level Security (RLS)

RLS is configured in Supabase (see `SUPABASE_SETUP.md`). It's database-level security that ensures:
- Users can only see online players (not offline ones)
- Users can only see their own match requests
- Only match participants can see/match updates

**In simple terms**: Even if someone tries to hack the frontend code, they can't access data they're not authorized to see because the database itself blocks them.

---

## Real-time Updates

### How Supabase Realtime Works

1. **Connection**: When the `LiveMatchClient` component loads, it opens a WebSocket connection to Supabase
2. **Subscription**: It subscribes to changes on a specific match record
3. **Listening**: Supabase watches the database for changes to that record
4. **Notification**: When the status changes (e.g., "waiting" → "in_progress"), Supabase sends a message through the WebSocket
5. **Update**: The component receives the message and updates the UI instantly

**Why WebSocket?**: Traditional HTTP requests are "one-way" - you ask for something, you get a response. WebSockets are "two-way" - the server can push updates to you at any time without you asking.

### Example Flow

1. Player A and Player B are viewing the same match
2. An admin (or automated system) updates the match status to "in_progress"
3. Both players' browsers receive the update within milliseconds
4. Both UIs update automatically - no page refresh needed!

---

## Data Flow Examples

### Signing Up a New User

1. User fills out signup form → `app/signup/page.tsx`
2. Form submits → calls `supabase.auth.signUp()`
3. Supabase creates user account → returns user object
4. App creates player profile → inserts into `players` table
5. User redirected to `/dashboard`
6. Dashboard loads → `requireAuth()` verifies user is logged in
7. Dashboard fetches online players → displays them

### Sending a Match Request

1. Player clicks "Request Match" on dashboard → `components/PlayerList.tsx`
2. Component calls `supabase.from('match_requests').insert()`
3. Match request created in database
4. Recipient's dashboard refreshes → sees new incoming request
5. Recipient can accept or reject → `components/MatchRequestActions.tsx`

### Accepting a Match Request

1. Player clicks "Accept" → `components/MatchRequestActions.tsx`
2. Updates match request status to "accepted"
3. Creates new match record in `matches` table
4. Redirects to `/match/[id]` page
5. Live match page loads → fetches match data
6. Sets up real-time subscription → listens for status changes

---

## Common Patterns

### Server vs Client Components

**Server Components** (default):
- Run on the server
- Can directly access the database
- Faster initial load
- Better for SEO
- Cannot use browser APIs (`useState`, `onClick`, etc.)

**Client Components** (marked with `'use client'`):
- Run in the browser
- Can handle user interactions
- Can use React hooks (`useState`, `useEffect`, etc.)
- Can access browser APIs

**Rule of thumb**: Use Server Components by default. Only use Client Components when you need interactivity.

### Async/Await

Many functions use `async`/`await` because they need to wait for:
- Database queries
- Authentication checks
- API calls

**Example**:
```typescript
const user = await getUser(); // Wait for user to be fetched
if (!user) redirect('/login'); // Then check if it exists
```

### Error Handling

Most database operations use try/catch blocks:
```typescript
try {
  const { error } = await supabase.from('players').insert(data);
  if (error) throw error; // If there's an error, throw it
  // Success!
} catch (err) {
  // Handle the error (show message to user, etc.)
}
```

---

## Tips for Understanding the Code

1. **Start with the flow**: Follow a user action from beginning to end
   - Example: "What happens when I click 'Request Match'?"

2. **Read the comments**: Each file has detailed comments explaining what it does

3. **Check the types**: TypeScript types tell you what data each function expects/returns

4. **Test incrementally**: Try adding `console.log()` statements to see what data is flowing through

5. **Read Supabase docs**: If you're confused about Supabase functions, check the official docs

---

## Questions?

If you're confused about any part of the code:
1. Check the comments in the file
2. Read the relevant section in this document
3. Look at how similar features are implemented elsewhere
4. Check the Supabase documentation for database/auth questions


