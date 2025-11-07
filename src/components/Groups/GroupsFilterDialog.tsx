import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FilterState {
  interests: string[];
  city: string;
  participantRange: [number, number];
  groupType: string;
}

interface GroupsFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export const GroupsFilterDialog = ({ open, onClose, onApplyFilters }: GroupsFilterDialogProps) => {
  const { language } = useLanguageContext();
  const isRTL = language === 'ar';

  const [interests, setInterests] = useState<Array<{ id: string; name: string; name_ar: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string; name_ar: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    interests: [],
    city: '',
    participantRange: [0, 500],
    groupType: 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [interestsData, citiesData] = await Promise.all([
          supabase.from('user_interests').select('*').order('name_ar'),
          supabase.from('cities').select('*').eq('is_active', true).order('name_ar')
        ]);

        if (interestsData.data) setInterests(interestsData.data);
        if (citiesData.data) setCities(citiesData.data);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  const handleInterestToggle = (interestId: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      interests: [],
      city: '',
      participantRange: [0, 500],
      groupType: 'all'
    });
  };

  const hasActiveFilters = 
    filters.interests.length > 0 || 
    filters.city !== '' || 
    filters.participantRange[0] !== 0 || 
    filters.participantRange[1] !== 500 ||
    filters.groupType !== 'all';

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            {isRTL ? 'تصفية المجموعات' : 'Filter Groups'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Interests Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">
                  {isRTL ? 'الاهتمامات' : 'Interests'}
                </Label>
                {filters.interests.length > 0 && (
                  <Badge variant="secondary">
                    {filters.interests.length} {isRTL ? 'محدد' : 'selected'}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg max-h-64 overflow-y-auto">
                {interests.map(interest => (
                  <div key={interest.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={interest.id}
                      checked={filters.interests.includes(interest.id)}
                      onCheckedChange={() => handleInterestToggle(interest.id)}
                    />
                    <Label 
                      htmlFor={interest.id}
                      className="cursor-pointer text-sm font-normal leading-tight"
                    >
                      {isRTL ? interest.name_ar : interest.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* City Filter */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">
                {isRTL ? 'المدينة' : 'City'}
              </Label>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'جميع المدن' : 'All Cities'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المدن' : 'All Cities'}</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {isRTL ? city.name_ar : city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Group Type */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">
                {isRTL ? 'نوع المجموعة' : 'Group Type'}
              </Label>
              <Select value={filters.groupType} onValueChange={(value) => setFilters(prev => ({ ...prev, groupType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                  <SelectItem value="region">{isRTL ? 'منطقة' : 'Region'}</SelectItem>
                  <SelectItem value="event">{isRTL ? 'فعالية' : 'Event'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Participant Range */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">
                {isRTL ? 'عدد المشاركين' : 'Participants'}
              </Label>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.participantRange[0]}</span>
                  <span>{filters.participantRange[1]}</span>
                </div>
                <Slider
                  value={filters.participantRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, participantRange: value as [number, number] }))}
                  min={0}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground text-center">
                  {isRTL 
                    ? `من ${filters.participantRange[0]} إلى ${filters.participantRange[1]} مشارك` 
                    : `${filters.participantRange[0]} to ${filters.participantRange[1]} participants`}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t bg-background">
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </Button>
          <Button 
            onClick={handleApply}
            className="flex-1"
          >
            {isRTL ? 'تطبيق التصفية' : 'Apply Filters'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};