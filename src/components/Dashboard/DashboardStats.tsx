import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Award, Star, MapPin } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color = 'primary' }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="relative overflow-hidden mobile-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full bg-${color}/10 flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`flex items-center text-xs ${getTrendColor()} mt-1`}>
            {getTrendIcon()}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: 'attendee' | 'organizer' | 'provider' | 'admin';
  stats?: any;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userRole, stats: propStats, isLoading }) => {
  const { t } = useLanguageContext();

  const getAttendeeStats = () => [
    {
      title: t('dashboardPage.totalBookings'),
      value: '12',
      change: '+2 هذا الشهر',
      trend: 'up' as const,
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
    {
      title: t('dashboardPage.upcomingEvents'),
      value: '3',
      change: 'خلال أسبوعين',
      trend: 'neutral' as const,
      icon: <MapPin className="h-4 w-4 text-blue-500" />,
    },
    {
      title: t('dashboardPage.loyaltyPoints'),
      value: '2,450',
      change: '+150 نقطة',
      trend: 'up' as const,
      icon: <Award className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: t('dashboardPage.totalSpent'),
      value: '3,200 ريال',
      change: '+450 ريال',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
  ];

  const getOrganizerStats = () => [
    {
      title: 'إجمالي الفعاليات',
      value: '24',
      change: '+3 هذا الشهر',
      trend: 'up' as const,
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
    {
      title: 'إجمالي المشاركين',
      value: '1,234',
      change: '+89 مشارك',
      trend: 'up' as const,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'الإيرادات الشهرية',
      value: '45,600 ريال',
      change: '+12%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'متوسط التقييم',
      value: '4.8',
      change: '+0.2',
      trend: 'up' as const,
      icon: <Star className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: 'الفعاليات النشطة',
      value: '8',
      change: 'جارية الآن',
      trend: 'neutral' as const,
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
    },
  ];

  const getProviderStats = () => [
    {
      title: 'إجمالي الخدمات',
      value: '15',
      change: '+2 هذا الشهر',
      trend: 'up' as const,
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
    {
      title: 'طلبات الخدمة',
      value: '89',
      change: '+15 طلب',
      trend: 'up' as const,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'الإيرادات الشهرية',
      value: '28,400 ريال',
      change: '+8%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'متوسط التقييم',
      value: '4.6',
      change: '+0.1',
      trend: 'up' as const,
      icon: <Star className="h-4 w-4 text-yellow-500" />,
    },
  ];

  const getAdminStats = () => [
    {
      title: 'إجمالي المستخدمين',
      value: '12,345',
      change: '+234 هذا الشهر',
      trend: 'up' as const,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
    {
      title: 'إجمالي الفعاليات',
      value: '1,456',
      change: '+45 فعالية',
      trend: 'up' as const,
      icon: <Calendar className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'إجمالي الإيرادات',
      value: '234,500 ريال',
      change: '+15%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'الفعاليات النشطة',
      value: '89',
      change: 'جارية الآن',
      trend: 'neutral' as const,
      icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: 'معدل النمو',
      value: '18%',
      change: '+3% نمو',
      trend: 'up' as const,
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
    },
  ];

  const getStats = () => {
    switch (userRole) {
      case 'attendee':
        return getAttendeeStats();
      case 'organizer':
        return getOrganizerStats();
      case 'provider':
        return getProviderStats();
      case 'admin':
        return getAdminStats();
      default:
        return getAttendeeStats();
    }
  };

  const stats = getStats();

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;