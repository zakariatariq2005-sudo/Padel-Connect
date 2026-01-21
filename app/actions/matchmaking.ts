'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server Actions for Matchmaking
 * 
 * These functions enforce business rules server-side:
 * - Only online users can send/receive requests
 * - One active outgoing request at a time
 * - Prevent duplicate/reciprocal requests
 * - Auto-expire old requests
 */

export type MatchRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

/**
 * Send a match request to another player
 * 
 * Business Rules:
 * - Both sender and receiver must be online
 * - Sender can only have one active outgoing request
 * - Cannot send to yourself
 * - Cannot send if there's already a pending request in either direction
 */
export async function sendMatchRequest(receiverId: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const senderId = user.id;

  // Validation: Cannot request yourself
  if (senderId === receiverId) {
    return { success: false, error: 'Cannot send request to yourself' };
  }

  // Check if sender is online
  const { data: senderProfile, error: senderError } = await supabase
    .from('players')
    .select('is_online')
    .eq('user_id', senderId)
    .single();

  if (senderError || !senderProfile) {
    return { success: false, error: 'Your profile not found. Please update your profile.' };
  }

  if (!senderProfile.is_online) {
    return { success: false, error: 'You must be online to send match requests' };
  }

  // Check if receiver is online
  const { data: receiverProfile, error: receiverError } = await supabase
    .from('players')
    .select('is_online')
    .eq('user_id', receiverId)
    .single();

  if (receiverError || !receiverProfile) {
    return { success: false, error: 'Player not found' };
  }

  if (!receiverProfile.is_online) {
    return { success: false, error: 'Player is not online' };
  }

  // Check if sender already has an active outgoing request
  const { data: existingOutgoing, error: outgoingError } = await supabase
    .from('match_requests')
    .select('id')
    .eq('sender_id', senderId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .limit(1);

  if (outgoingError) {
    return { success: false, error: 'Error checking existing requests' };
  }

  if (existingOutgoing && existingOutgoing.length > 0) {
    return { success: false, error: 'You already have an active match request. Please wait for a response or cancel it first.' };
  }

  // Check if there's already a pending request in either direction
  const { data: existingRequest, error: requestError } = await supabase
    .from('match_requests')
    .select('id, sender_id, receiver_id')
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .limit(1);

  if (requestError) {
    return { success: false, error: 'Error checking existing requests' };
  }

  if (existingRequest && existingRequest.length > 0) {
    const req = existingRequest[0];
    if (req.sender_id === senderId) {
      return { success: false, error: 'You already have a pending request to this player' };
    } else {
      return { success: false, error: 'This player already sent you a request. Check your incoming requests.' };
    }
  }

  // Expire old requests first
  await expireOldRequests();

  // Create the match request
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiration

  const { data: newRequest, error: insertError } = await supabase
    .from('match_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    // Check if it's a unique constraint violation
    if (insertError.code === '23505') {
      return { success: false, error: 'A pending request already exists between you and this player' };
    }
    return { success: false, error: insertError.message || 'Failed to send request' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true, data: newRequest };
}

/**
 * Accept a match request
 * 
 * Creates a match record and updates the request status.
 * Both players are then considered matched.
 */
export async function acceptMatchRequest(requestId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the request
  const { data: request, error: requestError } = await supabase
    .from('match_requests')
    .select('*')
    .eq('id', requestId)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .single();

  if (requestError || !request) {
    return { success: false, error: 'Request not found or already processed' };
  }

  // Check if request is expired
  if (new Date(request.expires_at) < new Date()) {
    // Auto-expire it
    await supabase
      .from('match_requests')
      .update({ status: 'expired' })
      .eq('id', requestId);
    
    return { success: false, error: 'This request has expired' };
  }

  // Check if receiver is still online
  const { data: receiverProfile } = await supabase
    .from('players')
    .select('is_online')
    .eq('user_id', user.id)
    .single();

  if (!receiverProfile?.is_online) {
    return { success: false, error: 'You must be online to accept requests' };
  }

  // Check if sender is still online
  const { data: senderProfile } = await supabase
    .from('players')
    .select('is_online')
    .eq('user_id', request.sender_id)
    .single();

  if (!senderProfile?.is_online) {
    return { success: false, error: 'The other player is no longer online' };
  }

  // Cancel any other pending requests from either player
  await supabase
    .from('match_requests')
    .update({ status: 'cancelled' })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},sender_id.eq.${request.sender_id},receiver_id.eq.${request.sender_id}`)
    .eq('status', 'pending')
    .neq('id', requestId);

  // Create the match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      player1_id: request.sender_id,
      player2_id: user.id,
      status: 'waiting',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (matchError) {
    return { success: false, error: matchError.message || 'Failed to create match' };
  }

  // Update request status and link to match
  const { error: updateError } = await supabase
    .from('match_requests')
    .update({ 
      status: 'accepted',
      match_id: match.id,
    })
    .eq('id', requestId);

  if (updateError) {
    // Rollback match creation
    await supabase.from('matches').delete().eq('id', match.id);
    return { success: false, error: 'Failed to update request status' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true, data: { match, requestId } };
}

/**
 * Decline a match request
 */
export async function declineMatchRequest(requestId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('match_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (error) {
    return { success: false, error: error.message || 'Failed to decline request' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true };
}

/**
 * Cancel an outgoing match request
 */
export async function cancelMatchRequest(requestId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('match_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('sender_id', user.id)
    .eq('status', 'pending');

  if (error) {
    return { success: false, error: error.message || 'Failed to cancel request' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true };
}

/**
 * Expire old match requests (called before operations)
 */
async function expireOldRequests() {
  const supabase = await createClient();
  
  await supabase
    .from('match_requests')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());
}

/**
 * Toggle online status
 */
export async function toggleOnlineStatus(isOnline: boolean) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('players')
    .update({ is_online: isOnline })
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message || 'Failed to update online status' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true };
}

