# Matchmaking System Documentation

## Overview

This document describes the real-time matchmaking "Requests" system for PadelConnect. The system allows online users to discover each other, send match requests, accept or decline them in real-time, and create confirmed matches only when both players explicitly agree.

## Architecture

### Database Schema

The system uses three main tables:

1. **`players`** - Stores player profiles with online status
2. **`match_requests`** - Stores match requests with expiration
3. **`matches`** - Stores confirmed matches

Key features:
- Requests expire after 30 minutes
- Unique constraint prevents duplicate pending requests
- Database functions enforce business rules

### Server Actions

All matchmaking operations are handled through Server Actions in `app/actions/matchmaking.ts`:

- `sendMatchRequest()` - Sends a match request (with validation)
- `acceptMatchRequest()` - Accepts a request and creates a match
- `declineMatchRequest()` - Declines a request
- `cancelMatchRequest()` - Cancels an outgoing request
- `toggleOnlineStatus()` - Toggles user's online/offline status

### Business Rules (Enforced Server-Side)

1. **Only online users can send/receive requests**
   - Checked before every operation
   - Both sender and receiver must be online

2. **One active outgoing request at a time**
   - Users can only have one pending outgoing request
   - Must cancel or wait for response before sending another

3. **No duplicate/reciprocal requests**
   - Cannot send if there's already a pending request in either direction
   - Unique database constraint enforces this

4. **Cannot request yourself**
   - Validated in `sendMatchRequest()`

5. **Auto-expiration**
   - Requests expire after 30 minutes
   - Expired automatically before operations
   - Status changes to 'expired'

6. **Match creation only on acceptance**
   - Match is created only when receiver accepts
   - All other pending requests from both players are cancelled

7. **Matched players removed from pool**
   - When a match is created, other pending requests are cancelled
   - Players can still be online but won't receive new requests while matched

## Pages

### `/dashboard`
- Shows online players
- "Request Match" button for each player
- Online toggle in header
- Link to Requests page

### `/requests`
- **Incoming Requests**: Shows pending requests sent to you
  - Accept/Decline buttons
  - Real-time updates
  
- **Outgoing Requests**: Shows requests you sent
  - Cancel button for pending requests
  - Status badges (pending, accepted, rejected, expired, cancelled)
  - Request history
  
- **Confirmed Matches**: Shows accepted matches
  - Opponent info
  - "View Match" and "Chat" buttons

## Real-Time Updates

The system uses Supabase Realtime subscriptions:

- `RequestsClient` subscribes to `match_requests` and `matches` tables
- `OnlineToggle` subscribes to `players` table for online status
- Updates trigger page refresh to show latest data

## Database Setup

Run the SQL script in `database/matchmaking_schema.sql` to:

1. Add expiration fields to `match_requests`
2. Create unique constraints
3. Create helper functions
4. Set up triggers

## Usage Flow

1. **User goes online** (toggles Online status)
2. **User sees other online players** on dashboard
3. **User sends request** to another player
4. **Receiver sees incoming request** on Requests page
5. **Receiver accepts/declines**
6. **If accepted**: Match is created, both players redirected to match page
7. **If declined/expired**: Request status updated, players can send new requests

## Error Handling

All Server Actions return `{ success: boolean, error?: string }` format:
- Client-side shows error messages via alerts
- Server-side validation prevents invalid operations
- Database constraints provide additional safety

## Future Enhancements

- Scheduled job for auto-expiring requests (currently done on-demand)
- Push notifications for new requests
- Chat functionality in confirmed matches
- Match history and statistics



