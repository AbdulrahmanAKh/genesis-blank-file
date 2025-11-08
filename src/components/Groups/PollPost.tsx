import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  votes_count: number;
}

interface PollPostProps {
  postId: string;
  onVote?: () => void;
}

export const PollPost: React.FC<PollPostProps> = ({ postId, onVote }) => {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const { toast } = useToast();
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = language === 'ar';

  useEffect(() => {
    loadPollData();
  }, [postId, user]);

  const loadPollData = async () => {
    if (!user) return;

    try {
      // Load poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('post_id', postId)
        .order('option_order', { ascending: true });

      if (optionsError) throw optionsError;

      setOptions(optionsData || []);
      const total = (optionsData || []).reduce((sum, opt) => sum + opt.votes_count, 0);
      setTotalVotes(total);

      // Check if user has voted
      const { data: voteData } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserVote(voteData?.option_id || null);
    } catch (error) {
      console.error('Error loading poll data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!user || userVote) return;

    try {
      // If user already voted, delete old vote first
      if (userVote) {
        await supabase
          .from('poll_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }

      // Insert new vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          post_id: postId,
          option_id: optionId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: isRTL ? 'تم التصويت' : 'Voted',
        description: isRTL ? 'تم تسجيل صوتك بنجاح' : 'Your vote has been recorded'
      });

      loadPollData();
      onVote?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'حدث خطأ أثناء التصويت' : 'Error voting',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const percentage = totalVotes > 0 ? (option.votes_count / totalVotes) * 100 : 0;
        const isSelected = userVote === option.id;

        return (
          <Card
            key={option.id}
            className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary' : ''
            } ${userVote ? 'cursor-default' : ''}`}
            onClick={() => !userVote && handleVote(option.id)}
          >
            <div className="relative z-10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {isSelected && <Check className="w-4 h-4 text-primary" />}
                <span className="text-sm font-medium">{option.option_text}</span>
              </div>
              {userVote && (
                <span className="text-xs text-muted-foreground font-semibold">
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
            {userVote && (
              <Progress
                value={percentage}
                className="absolute inset-0 h-full opacity-20"
              />
            )}
          </Card>
        );
      })}
      <div className="text-xs text-muted-foreground text-center pt-2">
        {totalVotes} {isRTL ? 'صوت' : totalVotes === 1 ? 'vote' : 'votes'}
      </div>
    </div>
  );
};
