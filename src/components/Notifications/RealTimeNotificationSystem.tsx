import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  CreditCard,
  Calendar,
  Gift,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  title_ar: string;
  message: string;
  message_ar: string;
  type: 'booking' | 'payment' | 'event' | 'social' | 'system' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
  actionText_ar?: string;
}

interface NotificationPreferences {
  // Channels
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  
  // Content Types
  bookingUpdates: boolean;
  eventReminders: boolean;
  paymentConfirmations: boolean;
  socialActivity: boolean;
  promotionalOffers: boolean;
  systemUpdates: boolean;
  
  // Timing
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Frequency
  instantNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

interface RealTimeNotificationSystemProps {
  userId?: string;
  showSettings?: boolean;
}

const RealTimeNotificationSystem: React.FC<RealTimeNotificationSystemProps> = ({
  userId,
  showSettings = true
}) => {
  const { t, isRTL } = useLanguageContext();
  const { toast } = useToast();
  const { notifications: dbNotifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    bookingUpdates: true,
    eventReminders: true,
    paymentConfirmations: true,
    socialActivity: false,
    promotionalOffers: true,
    systemUpdates: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    instantNotifications: true,
    dailyDigest: false,
    weeklyDigest: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());

  // Load real notifications from database
  useEffect(() => {
    if (dbNotifications && Array.isArray(dbNotifications)) {
      const formattedNotifications = dbNotifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        title_ar: notification.title,
        message: notification.message,
        message_ar: notification.message,
        type: notification.type as any,
        priority: 'medium' as const,
        read: notification.read,
        timestamp: new Date(notification.created_at),
        actionUrl: notification.data?.actionUrl,
        actionText: 'View',
        actionText_ar: 'عرض'
      }));
      setNotifications(formattedNotifications);
    }
  }, [dbNotifications]);

  // Simulate real-time connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'event': return <Bell className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'promotion': return <Gift className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'high': return <Zap className="w-3 h-3 text-orange-500" />;
      case 'medium': return <Info className="w-3 h-3 text-blue-500" />;
      case 'low': return <Clock className="w-3 h-3 text-gray-500" />;
      default: return <Info className="w-3 h-3 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: isRTL ? 'تم تحديث التفضيلات' : 'Preferences Updated',
      description: isRTL ? 'تم حفظ تفضيلاتك بنجاح' : 'Your preferences have been saved successfully'
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return isRTL ? 'الآن' : 'now';
    if (diffInMinutes < 60) return isRTL ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return isRTL ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return isRTL ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إدارة إشعاراتك وتفضيلاتك' : 'Manage your notifications and preferences'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? (isRTL ? 'متصل' : 'Connected') : (isRTL ? 'غير متصل' : 'Disconnected')}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isRTL ? 'تحديد الكل كمقروء' : 'Mark All Read'}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {isRTL ? 'الإشعارات الحديثة' : 'Recent Notifications'}
          </CardTitle>
          <CardDescription>
            {isRTL ? `${notifications.length} إشعار، ${unreadCount} غير مقروء` : `${notifications.length} notifications, ${unreadCount} unread`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'لا توجد إشعارات' : 'No Notifications'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد إشعارات جديدة في الوقت الحالي' : 'No new notifications at the moment'}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium line-clamp-1">
                              {isRTL ? notification.title_ar : notification.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {getPriorityIcon(notification.priority)}
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {isRTL ? notification.message_ar : notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            
                            {notification.actionText && (
                              <Button variant="ghost" size="sm" className="text-xs">
                                {isRTL ? notification.actionText_ar : notification.actionText}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تخصيص كيفية ووقت تلقي الإشعارات' : 'Customize how and when you receive notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Channels */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {isRTL ? 'قنوات الإشعار' : 'Notification Channels'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{isRTL ? 'إشعارات التطبيق' : 'In-App Notifications'}</span>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'الإشعارات داخل التطبيق' : 'Notifications within the app'}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inAppNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('inAppNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'الإشعارات عبر البريد الإلكتروني' : 'Notifications via email'}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Content Types */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {isRTL ? 'أنواع الإشعارات' : 'Notification Types'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>{isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}</span>
                  <Switch
                    checked={preferences.bookingUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('bookingUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{isRTL ? 'تذكيرات الفعاليات' : 'Event Reminders'}</span>
                  <Switch
                    checked={preferences.eventReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('eventReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{isRTL ? 'تأكيدات الدفع' : 'Payment Confirmations'}</span>
                  <Switch
                    checked={preferences.paymentConfirmations}
                    onCheckedChange={(checked) => handlePreferenceChange('paymentConfirmations', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeNotificationSystem;