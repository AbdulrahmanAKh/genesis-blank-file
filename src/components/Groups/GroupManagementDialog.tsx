import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupData } from '@/hooks/useGroupData';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Crown, 
  Shield, 
  UserMinus, 
  UserPlus, 
  MessageSquareOff,
  Settings,
  Users,
  Ban,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  status: 'active' | 'muted' | 'banned';
  avatar_url?: string;
  last_activity: string;
}

interface JoinRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  message?: string;
  requested_at: string;
  avatar_url?: string;
}

interface GroupManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
}

export const GroupManagementDialog = ({ open, onOpenChange, group }: GroupManagementDialogProps) => {
  const { language } = useLanguageContext();
  const { toast } = useToast();
  const { 
    members, 
    joinRequests, 
    membersLoading, 
    requestsLoading,
    handleMemberAction: performMemberAction,
    handleJoinRequest: performJoinRequest
  } = useGroupData(group?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  const handleMemberAction = async (memberId: string, action: string) => {
    try {
      await performMemberAction(memberId, action);
      
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تطبيق الإجراء بنجاح' : 'Action applied successfully'
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تطبيق الإجراء' : 'Failed to apply action',
        variant: 'destructive'
      });
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await performJoinRequest(requestId, action);
      
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: action === 'approve' ? 
          (language === 'ar' ? 'تم قبول الطلب' : 'Request approved') :
          (language === 'ar' ? 'تم رفض الطلب' : 'Request rejected')
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في معالجة الطلب' : 'Failed to process request',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return language === 'ar' ? 'مدير' : 'Admin';
      case 'moderator': return language === 'ar' ? 'مشرف' : 'Moderator';
      case 'member': return language === 'ar' ? 'عضو' : 'Member';
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{language === 'ar' ? 'نشط' : 'Active'}</Badge>;
      case 'muted':
        return <Badge variant="secondary">{language === 'ar' ? 'مكتوم' : 'Muted'}</Badge>;
      case 'banned':
        return <Badge variant="destructive">{language === 'ar' ? 'محظور' : 'Banned'}</Badge>;
      default:
        return null;
    }
  };

  const filteredMembers = members.filter(member => {
    const memberName = member.profiles?.full_name || 'عضو';
    return memberName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {language === 'ar' ? 'إدارة المجموعة' : 'Group Management'}
            <span className="text-muted-foreground">- {group.group_name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-[70vh]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الأعضاء' : 'Members'} ({members.length})
            </TabsTrigger>
            {group.type === 'private' && (
              <TabsTrigger value="requests">
                <UserPlus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'طلبات الانضمام' : 'Join Requests'} ({joinRequests.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 overflow-hidden">
            <div className="space-y-4 h-full">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={language === 'ar' ? 'البحث في الأعضاء...' : 'Search members...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {membersLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">لا توجد أعضاء</p>
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {(member.profiles?.full_name || 'عضو').charAt(0)}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{member.profiles?.full_name || 'عضو'}</h4>
                                {getRoleIcon(member.role)}
                              </div>
                              <p className="text-sm text-muted-foreground">عضو في المجموعة</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'انضم في' : 'Joined'} {formatDate(member.joined_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getRoleText(member.role)}</Badge>
                            <Badge variant={member.is_muted ? 'secondary' : 'default'}>
                              {member.is_muted ? (language === 'ar' ? 'مكتوم' : 'Muted') : (language === 'ar' ? 'نشط' : 'Active')}
                            </Badge>
                            
                            {member.role !== 'admin' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {member.role === 'member' && (
                                    <DropdownMenuItem onClick={() => handleMemberAction(member.id, 'promote')}>
                                      <Shield className="w-4 h-4 mr-2" />
                                      {language === 'ar' ? 'ترقية إلى مشرف' : 'Make Moderator'}
                                    </DropdownMenuItem>
                                  )}
                                  {member.role === 'moderator' && (
                                    <DropdownMenuItem onClick={() => handleMemberAction(member.id, 'demote')}>
                                      <UserMinus className="w-4 h-4 mr-2" />
                                      {language === 'ar' ? 'إزالة الإشراف' : 'Remove Moderator'}
                                    </DropdownMenuItem>
                                  )}
                                  {member.is_muted ? (
                                    <DropdownMenuItem onClick={() => handleMemberAction(member.id, 'unmute')}>
                                      <MessageSquareOff className="w-4 h-4 mr-2" />
                                      {language === 'ar' ? 'إلغاء الكتم' : 'Unmute Member'}
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleMemberAction(member.id, 'mute')}>
                                      <MessageSquareOff className="w-4 h-4 mr-2" />
                                      {language === 'ar' ? 'كتم العضو' : 'Mute Member'}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleMemberAction(member.id, 'remove')}
                                    className="text-red-600"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    {language === 'ar' ? 'إزالة العضو' : 'Remove Member'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Join Requests Tab */}
          {group.type === 'private' && (
            <TabsContent value="requests" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {requestsLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : joinRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {language === 'ar' ? 'لا توجد طلبات انضمام' : 'No Join Requests'}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'ar' ? 'لا توجد طلبات انضمام جديدة' : 'No pending join requests'}
                      </p>
                    </div>
                  ) : (
                    joinRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {request.user_name.charAt(0)}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{request.user_name}</h4>
                              <p className="text-sm text-muted-foreground">{request.user_email}</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'طلب في' : 'Requested'} {formatDate(request.requested_at)}
                              </p>
                              {request.message && (
                                <p className="text-sm mt-2 p-2 bg-muted/50 rounded">
                                  "{request.message}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleJoinRequest(request.id, 'approve')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'قبول' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleJoinRequest(request.id, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'رفض' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'ar' ? 'إحصائيات المجموعة' : 'Group Statistics'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{members.length}</div>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الأعضاء' : 'Total Members'}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{members.filter(m => m.role === 'admin').length}</div>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المدير' : 'Admins'}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{members.filter(m => m.role === 'moderator').length}</div>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المشرفين' : 'Moderators'}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{members.filter(m => m.is_muted).length}</div>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'مكتومين' : 'Muted'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'ar' ? 'إعدادات المجموعة' : 'Group Settings'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{language === 'ar' ? 'حذف المجموعة' : 'Delete Group'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'حذف المجموعة نهائياً مع جميع المحادثات' : 'Permanently delete the group and all messages'}
                        </p>
                      </div>
                      <Button variant="destructive">
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};