import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessageAttachment {
  id: string;
  file_url: string;
  file_type: 'image' | 'video' | 'audio';
  file_name?: string;
  file_size?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  created_at: string;
  group_id: string;
  attachments?: MessageAttachment[];
}

export const useGroupMessages = (groupId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    loadMessages();
    const cleanup = setupRealtimeSubscription();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [groupId]);

  const loadMessages = async () => {
    if (!groupId || !user) return;
    
    setIsLoading(true);
    try {
      // Get user's join date first
      const { data: memberData } = await supabase
        .from('group_members')
        .select('joined_at')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      const joinedAt = memberData?.joined_at;

      // Fetch messages after user joined
      const messagesQuery = supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      // Only show messages after user joined
      if (joinedAt) {
        messagesQuery.gte('created_at', joinedAt);
      }

      const { data, error } = await messagesQuery;
      if (error) throw error;

      // Fetch sender names and attachments
      const messagesWithDetails = await Promise.all((data || []).map(async (msg: any) => {
        const [profileResult, attachmentsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', msg.sender_id)
            .single(),
          supabase
            .from('group_message_attachments')
            .select('*')
            .eq('message_id', msg.id)
        ]);
        
        return {
          ...msg,
          sender_name: profileResult.data?.full_name || 'مستخدم',
          attachments: attachmentsResult.data || []
        };
      }));

      setMessages(messagesWithDetails);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Fetch sender name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', newMsg.sender_id)
            .single();

          setMessages((prev) => [...prev, {
            ...newMsg,
            sender_name: profile?.full_name || 'مستخدم'
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if ((!content.trim() && !attachments?.length) || !user || !groupId) return false;

    try {
      console.log('📤 Sending message with attachments:', attachments?.length || 0);
      
      // Insert message first
      const { data: messageData, error: messageError } = await supabase
        .from('group_messages')
        .insert({
          content: content.trim() || '📎 ملف مرفق',
          sender_id: user.id,
          group_id: groupId,
        })
        .select()
        .single();

      if (messageError) {
        console.error('❌ Message insert error:', messageError);
        throw messageError;
      }

      console.log('✅ Message created:', messageData.id);

      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        console.log('📎 Processing', attachments.length, 'attachments');
        
        for (const file of attachments) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            console.log('⬆️ Uploading file:', fileName, 'Size:', file.size);

            // Upload to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('group-media')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('❌ Upload error:', uploadError);
              throw uploadError;
            }

            console.log('✅ File uploaded:', uploadData.path);

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('group-media')
              .getPublicUrl(fileName);

            console.log('🔗 Public URL:', urlData.publicUrl);

            // Determine file type
            let fileType: 'image' | 'video' | 'audio' = 'image';
            if (file.type.startsWith('video/')) fileType = 'video';
            else if (file.type.startsWith('audio/')) fileType = 'audio';

            // Save attachment record
            const { error: attachmentError } = await supabase
              .from('group_message_attachments')
              .insert({
                message_id: messageData.id,
                file_url: urlData.publicUrl,
                file_type: fileType,
                file_name: file.name,
                file_size: file.size
              });

            if (attachmentError) {
              console.error('❌ Attachment record error:', attachmentError);
              throw attachmentError;
            }

            console.log('✅ Attachment saved to DB');
          } catch (fileError) {
            console.error('❌ Error processing file:', file.name, fileError);
          }
        }
      }

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    refetch: loadMessages
  };
};
