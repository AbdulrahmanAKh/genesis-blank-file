import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, FileText, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface ReportData {
  period: string;
  totalUsers: number;
  newUsers: number;
  totalEvents: number;
  approvedEvents: number;
  totalServices: number;
  approvedServices: number;
  totalBookings: number;
  totalRevenue: number;
  totalRefunds: number;
}

export const AdminReportsTab = () => {
  const { t, language } = useLanguageContext();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');

  const getPeriodDates = (period: ReportPeriod): { start: Date; end: Date }[] => {
    const now = new Date();
    const periods: { start: Date; end: Date }[] = [];

    switch (period) {
      case 'daily':
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          periods.push({
            start: startOfDay(date),
            end: endOfDay(date)
          });
        }
        break;
      case 'weekly':
        // Last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          periods.push({
            start: startOfWeek(date, { locale: ar }),
            end: endOfWeek(date, { locale: ar })
          });
        }
        break;
      case 'monthly':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          periods.push({
            start: startOfMonth(date),
            end: endOfMonth(date)
          });
        }
        break;
      case 'yearly':
        // Last 5 years
        for (let i = 4; i >= 0; i--) {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - i);
          periods.push({
            start: startOfYear(date),
            end: endOfYear(date)
          });
        }
        break;
      default:
        periods.push({
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
    }

    return periods;
  };

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['admin-reports', reportPeriod],
    queryFn: async () => {
      const periods = getPeriodDates(reportPeriod);
      const data: ReportData[] = [];

      // Batch fetch all data in parallel
      const periodPromises = periods.map(async (period) => {
        const startDate = period.start.toISOString();
        const endDate = period.end.toISOString();

        // Parallel queries for each period
        const [usersCount, newUsersCount, eventsResult, servicesResult, bookingsResult, refundsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('events').select('id, status', { count: 'exact' }).gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('services').select('id, status', { count: 'exact' }).gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('bookings').select('total_amount', { count: 'exact' }).eq('status', 'confirmed').gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('refunds').select('amount').eq('status', 'completed').gte('created_at', startDate).lte('created_at', endDate)
        ]);

        const approvedEvents = eventsResult.data?.filter(e => e.status === 'approved').length || 0;
        const approvedServices = servicesResult.data?.filter(s => s.status === 'approved').length || 0;
        const revenue = bookingsResult.data?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
        const refunds = refundsResult.data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;

        const periodLabel = format(period.start, 
          reportPeriod === 'daily' ? 'yyyy-MM-dd' :
          reportPeriod === 'weekly' ? (language === 'ar' ? "'أسبوع' w yyyy" : "'Week' w yyyy") :
          reportPeriod === 'monthly' ? 'MMMM yyyy' : 'yyyy',
          { locale: language === 'ar' ? ar : undefined }
        );

        return {
          period: periodLabel,
          totalUsers: usersCount.count || 0,
          newUsers: newUsersCount.count || 0,
          totalEvents: eventsResult.count || 0,
          approvedEvents,
          totalServices: servicesResult.count || 0,
          approvedServices,
          totalBookings: bookingsResult.count || 0,
          totalRevenue: revenue,
          totalRefunds: refunds
        };
      });

      const results = await Promise.all(periodPromises);
      return results.reverse(); // Most recent first
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const summaryStats = {
    totalUsers: reportData[0]?.totalUsers || 0,
    totalEvents: reportData.reduce((sum, r) => sum + r.totalEvents, 0),
    totalServices: reportData.reduce((sum, r) => sum + r.totalServices, 0),
    totalRevenue: reportData.reduce((sum, r) => sum + r.totalRevenue, 0),
    totalBookings: reportData.reduce((sum, r) => sum + r.totalBookings, 0)
  };

  const downloadCSV = () => {
    const headers = language === 'ar' 
      ? ['الفترة', 'إجمالي المستخدمين', 'مستخدمين جدد', 'إجمالي الفعاليات', 'فعاليات مقبولة', 'إجمالي الخدمات', 'خدمات مقبولة', 'الحجوزات', 'الإيرادات', 'المبالغ المستردة']
      : ['Period', 'Total Users', 'New Users', 'Total Events', 'Approved Events', 'Total Services', 'Approved Services', 'Bookings', 'Revenue', 'Refunds'];
    
    const rows = reportData.map(row => [
      row.period,
      row.totalUsers,
      row.newUsers,
      row.totalEvents,
      row.approvedEvents,
      row.totalServices,
      row.approvedServices,
      row.totalBookings,
      `${row.totalRevenue.toFixed(2)} ${language === 'ar' ? 'ر.س' : 'SAR'}`,
      `${row.totalRefunds.toFixed(2)} ${language === 'ar' ? 'ر.س' : 'SAR'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `admin-report-${reportPeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success(t('admin.reports.downloadSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('admin.reports.title')}
              </CardTitle>
              <CardDescription>
                {t('admin.reports.description')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={reportPeriod} onValueChange={(value: ReportPeriod) => setReportPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('admin.reports.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('admin.reports.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('admin.reports.monthly')}</SelectItem>
                  <SelectItem value="yearly">{t('admin.reports.yearly')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadCSV} variant="outline" disabled={isLoading || reportData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                {t('admin.reports.downloadCsv')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{summaryStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفعاليات</p>
                <p className="text-2xl font-bold">{summaryStats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الخدمات</p>
                <p className="text-2xl font-bold">{summaryStats.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">الحجوزات</p>
                <p className="text-2xl font-bold">{summaryStats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-teal-500" />
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات</p>
                <p className="text-2xl font-bold">{summaryStats.totalRevenue.toFixed(0)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>تقرير مفصل - {reportPeriod === 'daily' ? 'يومي' : reportPeriod === 'weekly' ? 'أسبوعي' : reportPeriod === 'monthly' ? 'شهري' : 'سنوي'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفترة</TableHead>
                    <TableHead className="text-center">إجمالي المستخدمين</TableHead>
                    <TableHead className="text-center">مستخدمين جدد</TableHead>
                    <TableHead className="text-center">الفعاليات</TableHead>
                    <TableHead className="text-center">الخدمات</TableHead>
                    <TableHead className="text-center">الحجوزات</TableHead>
                    <TableHead className="text-center">الإيرادات</TableHead>
                    <TableHead className="text-center">المسترد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell className="text-center">{row.totalUsers}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50">
                          +{row.newUsers}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.totalEvents} <span className="text-xs text-muted-foreground">({row.approvedEvents} مقبول)</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.totalServices} <span className="text-xs text-muted-foreground">({row.approvedServices} مقبول)</span>
                      </TableCell>
                      <TableCell className="text-center">{row.totalBookings}</TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {row.totalRevenue.toFixed(2)} ر.س
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {row.totalRefunds.toFixed(2)} ر.س
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};