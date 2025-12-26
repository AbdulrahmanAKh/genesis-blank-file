import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingTicketButtonProps {
  className?: string;
}

export const FloatingTicketButton: React.FC<FloatingTicketButtonProps> = ({ className }) => {
  const { language } = useLanguageContext();
  const isRTL = language === 'ar';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Fetch unread ticket count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('id, status')
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .in('status', ['open', 'replied']);

      return tickets?.length || 0;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (!user) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "fixed bottom-6 z-50",
              isRTL ? "left-6" : "right-6",
              className
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Button
              onClick={() => navigate('/communication-history')}
              size="lg"
              className={cn(
                "relative h-14 rounded-full shadow-lg",
                "bg-gradient-to-r from-primary to-primary/80",
                "hover:shadow-xl hover:scale-105 transition-all duration-300",
                isHovered ? "px-6 gap-2" : "w-14 px-0"
              )}
            >
              <MessageSquare className={cn("h-6 w-6", isHovered && "h-5 w-5")} />
              
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden font-medium"
                  >
                    {isRTL ? 'الرسائل' : 'Messages'}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge 
                    className="h-5 min-w-[20px] px-1.5 bg-red-500 text-white text-xs font-bold border-2 border-background"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                </motion.div>
              )}

              {/* Pulse animation for new messages */}
              {unreadCount > 0 && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? 'right' : 'left'}>
          <p>{isRTL ? 'عرض الرسائل والتذاكر' : 'View Messages & Tickets'}</p>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? `${unreadCount} محادثات نشطة` : `${unreadCount} active conversations`}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};