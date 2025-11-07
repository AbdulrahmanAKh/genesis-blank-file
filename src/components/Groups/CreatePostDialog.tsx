import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Image as ImageIcon, Video, BarChart3, X } from 'lucide-react';

interface CreatePostDialogProps {
  groupId: string;
  onPostCreated: () => void;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ groupId, onPostCreated }) => {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<'text' | 'media' | 'poll'>('text');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [canPost, setCanPost] = useState(false);
  const [memberRole, setMemberRole] = useState<string>('');
  const isRTL = language === 'ar';

  useEffect(() => {
    checkPermissions();
  }, [groupId, user]);

  const checkPermissions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setMemberRole(data.role);
      setCanPost(data.role === 'owner' || data.role === 'admin');
    }
  };

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const updateMediaUrl = (index: number, value: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = value;
    setMediaUrls(newUrls);
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!user || !canPost) return;

    if (postType === 'text' && !content.trim()) return;
    if (postType === 'media' && mediaUrls.filter(url => url.trim()).length === 0) return;
    if (postType === 'poll' && (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2)) return;

    setIsSubmitting(true);
    try {
      const postData: any = {
        group_id: groupId,
        user_id: user.id,
        content: content.trim()
      };

      if (postType === 'media') {
        postData.media_urls = mediaUrls.filter(url => url.trim());
        postData.media_type = mediaType;
      }

      // For polls, we'll store them in post content as JSON for now
      if (postType === 'poll') {
        postData.content = JSON.stringify({
          question: pollQuestion,
          options: pollOptions.filter(o => o.trim()),
          type: 'poll'
        });
      }

      const { error } = await supabase
        .from('group_posts')
        .insert(postData);

      if (error) throw error;

      toast({
        title: isRTL ? 'تم النشر' : 'Post Created',
        description: isRTL ? 'تم نشر منشورك بنجاح' : 'Your post has been published successfully'
      });

      // Reset form
      setContent('');
      setMediaUrls([]);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPostType('text');
      setOpen(false);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'حدث خطأ أثناء النشر' : 'Error creating post',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canPost) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {isRTL ? 'إنشاء منشور' : 'Create Post'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'إنشاء منشور جديد' : 'Create New Post'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={postType} onValueChange={(v) => setPostType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <Plus className="w-4 h-4 mr-1" />
              {isRTL ? 'نص' : 'Text'}
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="w-4 h-4 mr-1" />
              {isRTL ? 'وسائط' : 'Media'}
            </TabsTrigger>
            <TabsTrigger value="poll">
              <BarChart3 className="w-4 h-4 mr-1" />
              {isRTL ? 'استطلاع' : 'Poll'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <Textarea
              placeholder={isRTL ? 'ماذا تريد أن تشارك؟' : 'What do you want to share?'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <Textarea
              placeholder={isRTL ? 'أضف وصفاً (اختياري)' : 'Add a description (optional)'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
            
            <div className="space-y-2">
              <Label>{isRTL ? 'نوع الوسائط' : 'Media Type'}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mediaType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMediaType('image')}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  {isRTL ? 'صور' : 'Images'}
                </Button>
                <Button
                  type="button"
                  variant={mediaType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMediaType('video')}
                >
                  <Video className="w-4 h-4 mr-1" />
                  {isRTL ? 'فيديو' : 'Video'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'روابط الوسائط' : 'Media URLs'}</Label>
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={isRTL ? 'أدخل رابط الصورة/الفيديو' : 'Enter image/video URL'}
                    value={url}
                    onChange={(e) => updateMediaUrl(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMediaUrl(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addMediaUrl}>
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة رابط' : 'Add URL'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="poll" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'سؤال الاستطلاع' : 'Poll Question'}</Label>
              <Input
                placeholder={isRTL ? 'اكتب سؤالك هنا' : 'Write your question here'}
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'الخيارات' : 'Options'}</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`${isRTL ? 'خيار' : 'Option'} ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePollOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addPollOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  {isRTL ? 'إضافة خيار' : 'Add Option'}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? (isRTL ? 'جاري النشر...' : 'Publishing...') 
              : (isRTL ? 'نشر' : 'Publish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
