import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  GraduationCap, 
  HelpCircle,
  ChevronRight,
  Loader2,
  Calendar,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTicketMessages, useSendTicketMessage } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';

// Status color config
const statusConfig: Record<string, { 
  color: string; 
  bgColor: string; 
  label: string; 
  labelAr: string;
  icon: React.ReactNode;
}> = {
  open: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300', 
    label: 'Open', 
    labelAr: 'مفتوح',
    icon: <Clock className="w-3 h-3" />
  },
  replied: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-300', 
    label: 'Replied', 
    labelAr: 'تم الرد',
    icon: <MessageSquare className="w-3 h-3" />
  },
  resolved: { 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-300', 
    label: 'Resolved', 
    labelAr: 'محلول',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  disputed: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-300', 
    label: 'Disputed', 
    labelAr: 'متنازع',
    icon: <HelpCircle className="w-3 h-3" />
  }
};

const CommunicationHistory = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();
  const isRTL = language === 'ar';

  // Get ticket ID from URL
  useEffect(() => {
    const ticketId = searchParams.get('id');
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
  }, [searchParams]);

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['user-tickets-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          ticket_messages(count)
        `)
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);
  const { data: messages, isLoading: messagesLoading } = useTicketMessages(selectedTicketId || undefined);
  const sendMessage = useSendTicketMessage();

  const getTicketIcon = (type: string) => {
    switch (type) {
      case 'group_inquiry': return <Users className="h-4 w-4" />;
      case 'training_inquiry': return <GraduationCap className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.open;
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'gap-1 border transition-all',
          config.bgColor,
          config.color
        )}
      >
        {config.icon}
        {isRTL ? config.labelAr : config.label}
      </Badge>
    );
  };

  const filteredTickets = tickets?.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.ticket_type === activeTab;
  }) || [];

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setSearchParams({ id: ticketId });
  };

  const handleBack = () => {
    setSelectedTicketId(null);
    setSearchParams({});
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicketId) return;
    
    try {
      await sendMessage.mutateAsync({ ticketId: selectedTicketId, message: replyMessage });
      setReplyMessage('');
      toast({
        title: isRTL ? 'تم الإرسال' : 'Sent',
        description: isRTL ? 'تم إرسال ردك بنجاح' : 'Your reply was sent successfully'
      });
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل إرسال الرد' : 'Failed to send reply',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? 'سجل المحادثات' : 'Communication History'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `${filteredTickets.length} محادثة` : `${filteredTickets.length} conversations`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Tickets List - Left Panel */}
          <motion.div 
            className={cn(
              "lg:col-span-4 flex flex-col",
              selectedTicketId && "hidden lg:flex"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full mb-4 h-12">
                <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">
                  {isRTL ? 'الكل' : 'All'}
                </TabsTrigger>
                <TabsTrigger value="group_inquiry" className="flex-1 text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">{isRTL ? 'المجموعات' : 'Groups'}</span>
                </TabsTrigger>
                <TabsTrigger value="training_inquiry" className="flex-1 text-xs sm:text-sm">
                  <GraduationCap className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">{isRTL ? 'التدريب' : 'Training'}</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex-1 text-xs sm:text-sm">
                  <HelpCircle className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">{isRTL ? 'الدعم' : 'Support'}</span>
                </TabsTrigger>
              </TabsList>

              <Card className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredTickets.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>{isRTL ? 'لا توجد تذاكر' : 'No tickets found'}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {filteredTickets.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "p-4 rounded-xl cursor-pointer transition-all border",
                                selectedTicketId === ticket.id
                                  ? "bg-primary/10 border-primary/30"
                                  : "hover:bg-muted/50 border-transparent hover:border-border"
                              )}
                              onClick={() => handleSelectTicket(ticket.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  selectedTicketId === ticket.id ? "bg-primary/20" : "bg-muted"
                                )}>
                                  {getTicketIcon(ticket.ticket_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate text-sm">{ticket.subject}</h3>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {getStatusBadge(ticket.status)}
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(ticket.updated_at), 'PP', { 
                                        locale: isRTL ? ar : enUS 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className={cn(
                                  "h-4 w-4 text-muted-foreground flex-shrink-0",
                                  isRTL && "rotate-180"
                                )} />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </Tabs>
          </motion.div>

          {/* Message Thread - Right Panel */}
          <motion.div 
            className={cn(
              "lg:col-span-8 flex flex-col",
              !selectedTicketId && "hidden lg:flex"
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="flex-1 flex flex-col overflow-hidden">
              {selectedTicket ? (
                <>
                  {/* Thread Header */}
                  <CardHeader className="border-b py-4">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="lg:hidden"
                        onClick={handleBack}
                      >
                        <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
                      </Button>
                      <div className={cn(
                        "p-2 rounded-lg",
                        statusConfig[selectedTicket.status]?.bgColor || "bg-muted"
                      )}>
                        {getTicketIcon(selectedTicket.ticket_type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedTicket.status)}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(selectedTicket.created_at), 'PPp', { 
                              locale: isRTL ? ar : enUS 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages?.map((msg: any, index: number) => {
                          const isOwn = msg.sender_id === user?.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "flex gap-3",
                                isOwn && "flex-row-reverse"
                              )}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={msg.profiles?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {msg.profiles?.full_name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-3",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                                  : "bg-muted rounded-tl-sm"
                              )}>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                <p className={cn(
                                  "text-[10px] mt-1.5",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {format(new Date(msg.created_at), 'p', { 
                                    locale: isRTL ? ar : enUS 
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'resolved' && (
                    <div className="border-t p-4">
                      <div className="flex gap-3">
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={isRTL ? 'اكتب ردك...' : 'Type your reply...'}
                          className="min-h-[60px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <Button 
                          size="icon" 
                          className="h-[60px] w-[60px]"
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim() || sendMessage.isPending}
                        >
                          {sendMessage.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className={cn("h-5 w-5", isRTL && "rotate-180")} />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">
                      {isRTL ? 'اختر محادثة' : 'Select a conversation'}
                    </p>
                    <p className="text-sm mt-1">
                      {isRTL ? 'اختر تذكرة من القائمة لعرض التفاصيل' : 'Choose a ticket from the list to view details'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunicationHistory;