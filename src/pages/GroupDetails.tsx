import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GroupPostsFeed } from '@/components/Groups/GroupPostsFeed';
import { GroupDetailsHeader } from '@/components/Groups/GroupDetailsHeader';
import { GroupEventsPreview } from '@/components/Groups/GroupEventsPreview';
import { JoinRequestsDialog } from '@/components/Groups/JoinRequestsDialog';
import Navbar from '@/components/Layout/Navbar';
import { ArrowLeft, MapPin, Users, Crown, Shield, UserPlus, Lock, Calendar, User2, Tag, Wrench } from 'lucide-react';

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  is_muted: boolean;
  joined_at: string;
  full_name?: string;
  avatar_url?: string;
}

interface Interest {
  id: string;
  name: string;
  name_ar: string;
}

interface GroupInfo {
  id: string;
  group_name: string;
  description?: string;
  description_ar?: string;
  current_members: number;
  max_members: number;
  created_by: string;
  event_id?: string;
  image_url?: string;
  interests?: Interest[];
  equipment?: string[];
  city?: { name: string; name_ar: string };
}

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupInfo & { visibility?: string; requires_approval?: boolean } | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentMember, setCurrentMember] = useState<GroupMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinRequestsDialog, setShowJoinRequestsDialog] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const isRTL = language === 'ar';

  const canManageGroup = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  useEffect(() => {
    if (!groupId) return;
    loadGroupData();
  }, [groupId, user]);

  useEffect(() => {
    if (canManageGroup && groupId) {
      loadPendingRequestsCount();
    }
  }, [canManageGroup, groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);

      // Load group info
      const { data: groupData, error: groupError } = await supabase
        .from('event_groups')
        .select('*, visibility, requires_approval, description, description_ar, equipment, cities(name, name_ar)')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Load group interests
      const { data: interestsData } = await supabase
        .from('group_interests')
        .select('interest_id')
        .eq('group_id', groupId);

      // Fetch category details for interests
      const interests: Interest[] = [];
      if (interestsData && interestsData.length > 0) {
        for (const item of interestsData) {
          const { data: category } = await supabase
            .from('categories')
            .select('id, name, name_ar')
            .eq('id', item.interest_id)
            .single();
          
          if (category) {
            interests.push(category);
          }
        }
      }

      setGroup({ 
        ...groupData, 
        interests,
        city: groupData.cities 
      });

      // Load members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch profile names for all members
      const membersWithNames = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            full_name: profile?.full_name || 'مستخدم',
            avatar_url: profile?.avatar_url
          };
        })
      );

      setMembers(membersWithNames);

      // Find current user's membership (only if logged in)
      if (user) {
        const myMembership = membersWithNames.find(m => m.user_id === user.id);
        setCurrentMember(myMembership || null);
      }

    } catch (error) {
      console.error('Error loading group data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل بيانات المجموعة',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentMember || !user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', currentMember.id);

      if (error) throw error;

      // Update member count
      if (group) {
        await supabase
          .from('event_groups')
          .update({ current_members: Math.max(0, group.current_members - 1) })
          .eq('id', groupId!);
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم مغادرة المجموعة'
      });

      navigate('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء مغادرة المجموعة',
        variant: 'destructive'
      });
    }
  };

  const handleToggleMute = async () => {
    if (!currentMember) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .update({ is_muted: !currentMember.is_muted })
        .eq('id', currentMember.id);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: currentMember.is_muted ? 'تم إلغاء الكتم' : 'تم كتم الإشعارات'
      });

      loadGroupData();
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الإعدادات',
        variant: 'destructive'
      });
    }
  };

  const handleMembershipChange = () => {
    loadGroupData();
    if (canManageGroup) {
      loadPendingRequestsCount();
    }
  };

  const loadPendingRequestsCount = async () => {
    if (!groupId) return;
    
    const { count } = await supabase
      .from('group_join_requests')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'pending');
    
    setPendingRequestsCount(count || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'لم يتم العثور على المجموعة' : 'Group not found'}
            </p>
            <Button onClick={() => navigate('/groups')}>
              {isRTL ? 'العودة للمجموعات' : 'Back to Groups'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/groups')}
          className="mb-6"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'العودة للمجموعات' : 'Back to Groups'}
        </Button>

        <div className="space-y-6">
          {/* Unified Header Block - Header, Leaderboard, and Members merged */}
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <GroupDetailsHeader
              groupId={group.id}
              groupName={group.group_name}
              imageUrl={group.image_url}
              interests={group.interests}
              totalMembers={group.current_members}
              isMember={!!currentMember}
              memberRole={currentMember?.role}
              visibility={group.visibility}
              requiresApproval={group.requires_approval}
              onMembershipChange={handleMembershipChange}
              onLeaveGroup={handleLeaveGroup}
              pendingRequestsCount={pendingRequestsCount}
              onShowJoinRequests={() => setShowJoinRequestsDialog(true)}
            />
          </div>

      {/* Only show group content to members */}
      {currentMember && (
        <>
          {/* Join Requests Dialog */}
          <JoinRequestsDialog
            groupId={group.id}
            open={showJoinRequestsDialog}
            onClose={() => setShowJoinRequestsDialog(false)}
            onRequestHandled={() => {
              handleMembershipChange();
              loadPendingRequestsCount();
            }}
          />

          {/* Events Preview */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <GroupEventsPreview groupId={group.id} />
              </div>

              {/* Posts Feed */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/20">
                  <h2 className="text-2xl font-bold">
                    {isRTL ? 'المنشورات' : 'Posts'}
                  </h2>
                </div>
                <div className="p-6">
                  <GroupPostsFeed groupId={group.id} userRole={currentMember?.role} />
                </div>
              </div>
            </>
          )}

          {/* Non-members detailed view */}
          {!currentMember && group && (
            <NonMemberGroupView 
              group={group} 
              members={members}
              isRTL={isRTL}
              onMembershipChange={handleMembershipChange}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Non-member view component
const NonMemberGroupView: React.FC<{
  group: GroupInfo & { visibility?: string; requires_approval?: boolean };
  members: GroupMember[];
  isRTL: boolean;
  onMembershipChange: () => void;
}> = ({ group, members, isRTL, onMembershipChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  const owner = members.find(m => m.role === 'owner');
  const admins = members.filter(m => m.role === 'admin');
  const previewMembers = members.slice(0, 8);

  useEffect(() => {
    if (user && group.requires_approval) {
      checkPendingRequest();
    }
  }, [user, group.id, group.requires_approval]);

  const checkPendingRequest = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('group_join_requests')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();
    
    setHasPendingRequest(!!data);
  };
  
  const handleJoinGroup = async () => {
    if (!user) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        variant: 'destructive'
      });
      return;
    }

    if (hasPendingRequest) {
      toast({
        title: isRTL ? 'تنبيه' : 'Notice',
        description: isRTL ? 'لديك طلب انضمام قيد المراجعة' : 'You already have a pending join request',
        variant: 'default'
      });
      return;
    }

    try {
      setIsJoining(true);

      if (group.requires_approval) {
        // Check for existing request
        const { data: existingRequest } = await supabase
          .from('group_join_requests')
          .select('id, status')
          .eq('group_id', group.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingRequest) {
          // Reactivate the request
          const { error } = await supabase
            .from('group_join_requests')
            .update({ 
              status: 'pending', 
              reviewed_at: null, 
              created_at: new Date().toISOString() 
            })
            .eq('id', existingRequest.id);

          if (error) throw error;
        } else {
          // Create new request
          const { error } = await supabase
            .from('group_join_requests')
            .insert({
              group_id: group.id,
              user_id: user.id
            });

          if (error) throw error;
        }

        setHasPendingRequest(true);

        toast({
          title: isRTL ? 'تم الإرسال' : 'Request Sent',
          description: isRTL ? 'تم إرسال طلب الانضمام للمسؤولين' : 'Join request sent to admins'
        });
      } else {
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          });

        if (error) throw error;

        toast({
          title: isRTL ? 'تم الانضمام' : 'Joined',
          description: isRTL ? 'تم الانضمام للمجموعة بنجاح' : 'Successfully joined the group'
        });

        onMembershipChange();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل الانضمام للمجموعة' : 'Failed to join group',
        variant: 'destructive'
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Group Description */}
      {(group.description || group.description_ar) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isRTL ? 'نبذة عن المجموعة' : 'About the Group'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
              {isRTL ? group.description_ar || group.description : group.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Group Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Location & Members Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {isRTL ? 'معلومات المجموعة' : 'Group Info'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>
                {isRTL ? 'السعودية' : 'Saudi Arabia'}
                {group.city && `, ${isRTL ? group.city.name_ar : group.city.name}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {group.current_members} / {group.max_members} {isRTL ? 'عضو' : 'members'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {group.visibility === 'private' ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Users className="w-4 h-4 text-muted-foreground" />
              )}
              <Badge variant="outline">
                {group.visibility === 'public' 
                  ? (isRTL ? 'مجموعة عامة' : 'Public Group')
                  : (isRTL ? 'مجموعة خاصة' : 'Private Group')}
              </Badge>
            </div>
            {group.requires_approval && (
              <div className="flex items-center gap-3 text-amber-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  {isRTL ? 'تحتاج موافقة للانضمام' : 'Requires approval to join'}
                </span>
              </div>
            )}
            {group.equipment && group.equipment.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wrench className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {isRTL ? 'المعدات المطلوبة' : 'Required Equipment'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.equipment.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {group.interests && group.interests.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {isRTL ? 'الاهتمامات' : 'Interests'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.interests.map((interest) => (
                    <Badge key={interest.id} variant="secondary">
                      {isRTL ? interest.name_ar : interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner & Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              {isRTL ? 'مسؤولو المجموعة' : 'Group Managers'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={owner.avatar_url} />
                  <AvatarFallback>{owner.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {owner.full_name}
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? 'مالك المجموعة' : 'Group Owner'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Admins */}
            {admins.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {isRTL ? 'المشرفون' : 'Admins'}
                </p>
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.avatar_url} />
                      <AvatarFallback>{admin.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {admin.full_name}
                        <Shield className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {isRTL ? 'أعضاء المجموعة' : 'Group Members'}
            <Badge variant="secondary" className="mr-2">{group.current_members}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {previewMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{member.full_name}</span>
                {member.role === 'owner' && <Crown className="w-3 h-3 text-yellow-500" />}
                {member.role === 'admin' && <Shield className="w-3 h-3 text-blue-500" />}
              </div>
            ))}
            {members.length > 8 && (
              <div className="flex items-center justify-center p-2 bg-muted rounded-lg min-w-[80px]">
                <span className="text-sm text-muted-foreground">
                  +{members.length - 8} {isRTL ? 'آخرين' : 'more'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Join Button */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">
              {isRTL ? 'انضم إلى هذه المجموعة' : 'Join this Group'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isRTL 
                ? 'انضم للمجموعة للوصول إلى المحتوى والفعاليات والمشاركة مع الأعضاء'
                : 'Join the group to access content, events, and participate with members'}
            </p>
            <Button
              size="lg"
              onClick={handleJoinGroup}
              disabled={isJoining || hasPendingRequest}
              className="gap-2 min-w-[200px]"
            >
              <UserPlus className="w-5 h-5" />
              {hasPendingRequest
                ? (isRTL ? 'تم الإرسال!' : 'Request Sent!')
                : isJoining
                ? (isRTL ? 'جاري الانضمام...' : 'Joining...')
                : group.requires_approval
                ? (isRTL ? 'طلب الانضمام' : 'Request to Join')
                : (isRTL ? 'انضم الآن' : 'Join Now')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDetails;
