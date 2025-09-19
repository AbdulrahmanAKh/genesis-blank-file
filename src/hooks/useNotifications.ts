import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabaseServices } from '@/services/supabaseServices';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  
  const { data: notifications, isLoading, refetch } = useSupabaseQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [] };
      return await supabaseServices.notificationsService.getByUserId(user.id);
    },
    enabled: !!user?.id
  });

  const markAsRead = async (notificationId: string) => {
    try {
      await supabaseServices.notificationsService.markAsRead(notificationId);
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await supabaseServices.notificationsService.markAllAsRead(user.id);
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications?.data?.filter((n: any) => !n.read).length || 0;

  return {
    notifications: notifications?.data || [],
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch
  };
};