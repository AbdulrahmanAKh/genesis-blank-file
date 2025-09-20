import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Wallet,
  Plus,
  Eye,
  Settings,
  MessageSquare,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user, profile } = useAuth();

  // Mock data - would come from API
  const services = [
    {
      id: '1',
      name: 'تأجير معدات تسلق',
      category: 'معدات رياضية',
      location: 'الطائف',
      price: 150,
      bookings: 12,
      rating: 4.8,
      status: 'active'
    },
    {
      id: '2',
      name: 'خدمة نقل VIP',
      category: 'مواصلات',
      location: 'الرياض',
      price: 300,
      bookings: 8,
      rating: 4.9,
      status: 'active'
    }
  ];

  const stats = {
    totalServices: 5,
    totalRevenue: 28450,
    totalBookings: 84,
    activeServices: 3,
    avgRating: 4.7
  };

  const serviceRequests = [
    {
      id: '1',
      eventTitle: 'رحلة جبلية مثيرة',
      organizer: 'أحمد الرحلات',
      serviceType: 'معدات تسلق',
      requestedPrice: 150,
      message: 'نحتاج معدات تسلق لـ 25 شخص',
      date: new Date(),
      status: 'pending'
    },
    {
      id: '2',
      eventTitle: 'مخيم الصحراء',
      organizer: 'مخيمات المملكة',
      serviceType: 'خدمة نقل',
      requestedPrice: 500,
      message: 'نقل مجموعة من الرياض إلى الأحساء',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'accepted'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                مرحباً، {profile?.full_name || 'مقدم الخدمة'}!
              </h1>
              <p className="text-muted-foreground">
                إدارة خدماتك ومتابعة طلبات المنظمين
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة خدمة جديدة
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalServices}</div>
                <p className="text-xs text-muted-foreground">
                  +1 هذا الشهر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalRevenue.toLocaleString()} ريال
                </div>
                <p className="text-xs text-muted-foreground">
                  +20% من الشهر الماضي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  +12 هذا الشهر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الخدمات النشطة</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.activeServices}</div>
                <p className="text-xs text-muted-foreground">
                  متاحة للحجز
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                <p className="text-xs text-muted-foreground">
                  من 5 نجوم
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  خدماتي النشطة
                </CardTitle>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>
              <CardDescription>
                الخدمات المتاحة للحجز حالياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{service.category}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {service.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {service.bookings} حجز
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{service.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <p className="font-semibold">{service.price} ريال</p>
                      <p className="text-xs text-muted-foreground">سعر الجلسة</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Settings className="h-3 w-3" />
                        إدارة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  طلبات الخدمة
                </CardTitle>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>
              <CardDescription>
                طلبات ربط الخدمات الواردة من المنظمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{request.eventTitle}</h4>
                        <p className="text-sm text-muted-foreground">{request.organizer}</p>
                      </div>
                      <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                        {request.status === 'pending' ? 'قيد المراجعة' : 'مقبول'}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">نوع الخدمة:</span>
                        <span>{request.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">السعر المطلوب:</span>
                        <span className="font-medium">{request.requestedPrice} ريال</span>
                      </div>
                    </div>
                    
                    <p className="text-sm bg-muted p-3 rounded-lg mb-3">
                      "{request.message}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        }).format(request.date)}
                      </span>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            رفض
                          </Button>
                          <Button size="sm">
                            قبول
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'accepted' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Phone className="h-3 w-3" />
                            اتصال
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Mail className="h-3 w-3" />
                            رسالة
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>إضافة خدمة</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>الرسائل</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Wallet className="h-6 w-6" />
                  <span>المحفظة</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>التقارير</span>
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

export default ProviderDashboard;