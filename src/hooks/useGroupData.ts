import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabaseServices } from '@/services/supabaseServices';
import { useAuth } from '@/contexts/AuthContext';

export const useGroupData = (groupId?: string) => {
  const { user } = useAuth();
  
  const { data: groupMembers, isLoading: membersLoading, refetch: refetchMembers } = useSupabaseQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return { data: [] };
      const { data, error } = await supabaseServices.supabase
        .from('group_members')
        .select(`
          *,
          profiles!group_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq('group_id', groupId);
      
      if (error) throw error;
      return { data: data || [] };
    },
    enabled: !!groupId
  });

  const { data: joinRequests, isLoading: requestsLoading, refetch: refetchRequests } = useSupabaseQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: async () => {
      if (!groupId) return { data: [] };
      // This would need a join_requests table to be implemented
      return { data: [] };
    },
    enabled: !!groupId
  });

  const handleMemberAction = async (memberId: string, action: string) => {
    if (!groupId) return;
    
    try {
      switch (action) {
        case 'promote':
          await supabaseServices.supabase
            .from('group_members')
            .update({ role: 'moderator' })
            .eq('id', memberId);
          break;
        case 'demote':
          await supabaseServices.supabase
            .from('group_members')
            .update({ role: 'member' })
            .eq('id', memberId);
          break;
        case 'mute':
          await supabaseServices.supabase
            .from('group_members')
            .update({ is_muted: true })
            .eq('id', memberId);
          break;
        case 'unmute':
          await supabaseServices.supabase
            .from('group_members')
            .update({ is_muted: false })
            .eq('id', memberId);
          break;
        case 'remove':
          await supabaseServices.supabase
            .from('group_members')
            .delete()
            .eq('id', memberId);
          break;
      }
      
      refetchMembers();
    } catch (error) {
      console.error('Error performing member action:', error);
      throw error;
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'approve' | 'reject') => {
    // This would need to be implemented when join_requests table is created
    console.log(`${action} join request:`, requestId);
    refetchRequests();
  };

  return {
    members: groupMembers?.data || [],
    joinRequests: joinRequests?.data || [],
    membersLoading,
    requestsLoading,
    handleMemberAction,
    handleJoinRequest,
    refetchMembers,
    refetchRequests
  };
};