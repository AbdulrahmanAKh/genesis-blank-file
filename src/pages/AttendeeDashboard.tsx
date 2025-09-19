import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { eventsService, bookingsService, loyaltyService } from '@/services/supabaseServices';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Heart, 
  Ticket, 
  Gift,
  TrendingUp,
  Clock,
  Users,
  Search
} from 'lucide-react';

const AttendeeDashboard = () => {
  const { user, profile } = useAuth();

  // Fetch user's bookings
  const { data: userBookings, isLoading: bookingsLoading } = useSupabaseQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: () => user?.id ? bookingsService.getByUser(user.id) : Promise.resolve({ data: [] }),
    enabled: !!user?.id
  });

  // Fetch user's loyalty points
  const { data: loyaltyPoints, isLoading: loyaltyLoading } = useSupabaseQuery({
    queryKey: ['user-loyalty', user?.id],
    queryFn: () => user?.id ? loyaltyService.getPointsByUserId(user.id) : Promise.resolve({ data: [] }),
    enabled: !!user?.id
  });

  const upcomingEvents = userBookings?.data?.filter((booking: any) => 
    booking.status === 'confirmed' && 
    booking.events && 
    new Date(booking.events.start_date) > new Date()
  )?.map((booking: any) => ({
    id: booking.id,
    title: booking.events.title_ar || booking.events.title,
    date: new Date(booking.events.start_date),
    location: booking.events.location_ar || booking.events.location,
    image: booking.events.image_url || '/placeholder.svg',
    price: booking.total_amount,
    status: booking.status
  })) || [];

  const totalPoints = loyaltyPoints?.data?.reduce((sum: number, point: any) => sum + point.points, 0) || 0;
  const eventsAttended = userBookings?.data?.filter((booking: any) => 
    booking.status === 'completed' || 
    (booking.events && new Date(booking.events.end_date) < new Date())
  )?.length || 0;

  const stats = {
    eventsAttended,
    totalPoints,
    favoriteOrganizers: 0, // This would need a separate query
    upcomingBookings: upcomingEvents.length
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                مرحباً، {profile?.full_name || 'المستخدم'}!
              </h1>
              <p className="text-muted-foreground">
                استكشف أحدث الفعاليات واحجز مغامرتك القادمة
              </p>
            </div>
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              استكشاف الفعاليات
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الفعاليات المحضورة</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stats.eventsAttended}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  إجمالي الفعاليات المحضورة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نقاط الولاء</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loyaltyLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  إجمالي النقاط المتاحة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المنظمين المفضلين</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.favoriteOrganizers}</div>
                <p className="text-xs text-muted-foreground">
                  +1 منظم جديد
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحجوزات القادمة</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  الفعاليات القادمة
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  فعالياتي القادمة
                </CardTitle>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>
              <CardDescription>
                الفعاليات التي حجزتها والقادمة قريباً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsLoading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد فعاليات قادمة</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.date.toLocaleDateString('ar-SA')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                        {event.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{event.price} ريال</p>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      التفاصيل
                    </Button>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Events - This would need a favorites table in the database */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  الفعاليات المفضلة
                </CardTitle>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>
              <CardDescription>
                الفعاليات التي أضفتها إلى قائمة المفضلة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لم تقم بإضافة أي فعاليات إلى المفضلة بعد</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>
                الأنشطة الأكثر استخداماً في حسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Search className="h-6 w-6" />
                  <span>استكشاف الفعاليات</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Gift className="h-6 w-6" />
                  <span>استبدال النقاط</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>مجموعاتي</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AttendeeDashboard;