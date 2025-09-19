import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, TrendingUp, Plus, Eye, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { DashboardStats } from '@/components/Dashboard/DashboardStats';

const UserDashboard = () => {
  const { userRole } = useAuth();
  const { t } = useLanguageContext();

  const AttendeeDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('index.welcomeBack')}</h2>
        <p className="text-muted-foreground">{t('index.discoverEvents')}</p>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('dashboardPage.quickStats')}</h3>
        <DashboardStats userRole="attendee" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboardPage.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild className="h-auto p-4 justify-start">
              <Link to="/explore" className="flex items-center gap-3">
                <Eye className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('dashboardPage.exploreEvents')}</div>
                  <div className="text-sm text-muted-foreground">{t('explore.title')}</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link to="/my-events" className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('myEvents.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboardPage.bookingHistory')}</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OrganizerDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('organizerDashboard.title')}</h2>
        <p className="text-muted-foreground">{t('organizerDashboard.subtitle')}</p>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('dashboardPage.analytics')}</h3>
        <DashboardStats userRole="organizer" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboardPage.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild className="h-auto p-4 justify-start">
              <Link to="/create-event" className="flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('createEvent.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('createEvent.basicInfo')}</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link to="/manage-events" className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('manageEvents.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('manageEvents.subtitle')}</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>{t('organizerDashboard.recentEvents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">رحلة جبلية إلى أبها</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2024-02-15
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      25/30 مشارك
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">ورشة طبخ تقليدي</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2024-02-20
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      12/15 مشارك
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProviderDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('providerDashboard.title')}</h2>
        <p className="text-muted-foreground">{t('providerDashboard.subtitle')}</p>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('dashboardPage.analytics')}</h3>
        <DashboardStats userRole="provider" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboardPage.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild className="h-auto p-4 justify-start">
              <Link to="/create-service" className="flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('createService.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('createService.basicInfo')}</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link to="/manage-services" className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t('manageServices.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('manageServices.subtitle')}</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle>{t('providerDashboard.recentServices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">📷</div>
                </div>
                <div>
                  <h4 className="font-semibold">تأجير معدات التصوير</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      الرياض
                    </span>
                    <span>200 ريال</span>
                  </div>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">🍽️</div>
                </div>
                <div>
                  <h4 className="font-semibold">خدمة الطعام والمشروبات</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      جدة
                    </span>
                    <span>50 ريال</span>
                  </div>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (userRole) {
    case 'attendee':
      return <AttendeeDashboard />;
    case 'organizer':
      return <OrganizerDashboard />;
    case 'provider':
      return <ProviderDashboard />;
    default:
      return null;
  }
};

export default UserDashboard;