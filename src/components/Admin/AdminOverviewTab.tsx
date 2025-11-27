import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguageContext } from '@/contexts/LanguageContext';
import {
  Users, Calendar, FileText, DollarSign, CheckCircle, AlertTriangle,
  TrendingUp, Activity, BarChart3
} from 'lucide-react';

interface AdminOverviewTabProps {
  stats: {
    totalUsers: number;
    userGrowth: string;
    totalEvents: number;
    eventGrowth: string;
    totalServices: number;
    totalRevenue: number;
    revenueGrowth: string;
    activeBookings: number;
    totalCategories: number;
    pendingReviews: number;
    dauMau: number;
    userChurn: number;
    arpu: number;
    bookingConversion: number;
    pendingVerifications: number;
    openSupportTickets: number;
  };
  loading: boolean;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ stats, loading }) => {
  const { t, language } = useLanguageContext();

  const statsCards = [
    {
      title: t('admin.kpis.totalUsers'),
      value: stats.totalUsers,
      change: stats.userGrowth,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: t('admin.kpis.dauMau'),
      value: `${(stats.dauMau * 100).toFixed(1)}%`,
      change: '',
      icon: Activity,
      color: 'text-cyan-500'
    },
    {
      title: t('admin.kpis.userChurn'),
      value: `${stats.userChurn.toFixed(1)}%`,
      change: '',
      icon: TrendingUp,
      color: 'text-red-500'
    },
    {
      title: t('admin.kpis.totalRevenue'),
      value: `${stats.totalRevenue.toFixed(0)} ${language === 'ar' ? 'ر.س' : 'SAR'}`,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: t('admin.kpis.arpu'),
      value: `${stats.arpu.toFixed(0)} ${language === 'ar' ? 'ر.س' : 'SAR'}`,
      change: '',
      icon: BarChart3,
      color: 'text-purple-500'
    },
    {
      title: t('admin.kpis.bookings'),
      value: stats.activeBookings,
      change: '',
      icon: Calendar,
      color: 'text-orange-500'
    },
    {
      title: t('admin.kpis.bookingConversion'),
      value: `${stats.bookingConversion.toFixed(1)}%`,
      change: '',
      icon: CheckCircle,
      color: 'text-teal-500'
    },
    {
      title: t('admin.kpis.pendingVerifications'),
      value: stats.pendingVerifications,
      change: '',
      icon: AlertTriangle,
      color: 'text-yellow-500'
    },
    {
      title: t('admin.kpis.openTickets'),
      value: stats.openSupportTickets,
      change: '',
      icon: FileText,
      color: 'text-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-muted"></CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {' '}
                    {language === 'ar' ? 'من الشهر الماضي' : 'from last month'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'الإحصائيات الرئيسية للنظام' : 'Main system statistics'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'فعاليات نشطة' : 'Active Events'}
                </p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'حجوزات نشطة' : 'Active Bookings'}
                </p>
                <p className="text-2xl font-bold">{stats.activeBookings}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'التصنيفات' : 'Categories'}
                </p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
