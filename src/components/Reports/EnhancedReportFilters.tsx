import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EnhancedReportFiltersProps {
  selectedYear: number;
  selectedMonth: number | null;
  selectedDay: Date | null;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | null) => void;
  onDayChange: (day: Date | null) => void;
  onApplyFilters: () => void;
}

export const EnhancedReportFilters: React.FC<EnhancedReportFiltersProps> = ({
  selectedYear,
  selectedMonth,
  selectedDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  onApplyFilters
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' }
  ];

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Year Selector */}
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">السنة</label>
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر السنة" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Month Selector */}
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">الشهر (اختياري)</label>
        <Select 
          value={selectedMonth?.toString() || 'all'} 
          onValueChange={(value) => onMonthChange(value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="جميع الأشهر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأشهر</SelectItem>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day Selector */}
      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium mb-2 block">اليوم (اختياري)</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-right font-normal",
                !selectedDay && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {selectedDay ? format(selectedDay, "PPP", { locale: ar }) : "اختر يوم محدد"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDay || undefined}
              onSelect={(date) => onDayChange(date || null)}
              initialFocus
              className="pointer-events-auto"
            />
            {selectedDay && (
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => onDayChange(null)}
                >
                  إلغاء التحديد
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Apply Button */}
      <Button onClick={onApplyFilters} className="min-w-[120px]">
        تطبيق الفلتر
      </Button>
    </div>
  );
};
