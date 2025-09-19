import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { eventsService } from "@/services/supabaseServices";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedEvents = () => {
  const { data: events, isLoading } = useSupabaseQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventsService.getAll()
  });

  const featuredEvents = events?.data?.filter(event => event.featured === true)?.slice(0, 3) || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "سهل": return "bg-green-100 text-green-800";
      case "متوسط": return "bg-yellow-100 text-yellow-800";
      case "صعب": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            الفعاليات المميزة
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اكتشف أفضل المغامرات والأنشطة الخارجية المتاحة هذا الأسبوع
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : featuredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">لا توجد فعاليات مميزة حالياً</h3>
              <p className="text-muted-foreground">ستتم إضافة فعاليات مميزة قريباً</p>
            </div>
          ) : (
            featuredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden group hover:shadow-lg smooth-transition adventure-shadow">
              <div className="relative">
                 <img 
                   src={event.image_url || '/placeholder.svg'} 
                   alt={event.title || event.title_ar}
                   className="w-full h-48 object-cover group-hover:scale-105 smooth-transition"
                 />
                 <div className="absolute top-4 right-4 flex gap-2">
                   {event.difficulty_level && (
                     <Badge className={getDifficultyColor(event.difficulty_level)}>
                       {event.difficulty_level}
                     </Badge>
                   )}
                   {event.categories && (
                     <Badge variant="secondary" className="bg-white/90">
                       {event.categories.name_ar || event.categories.name}
                     </Badge>
                   )}
                 </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-sm font-bold text-primary">
                      {event.price} ريال
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      شامل الضريبة
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                  <div className="space-y-3">
                         <h3 className="text-xl font-semibold text-foreground group-hover:text-primary smooth-transition">
                           {event.title_ar || event.title}
                         </h3>
                         
                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <MapPin className="w-4 h-4" />
                             {event.location_ar || event.location}
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar className="w-4 h-4" />
                             {new Date(event.start_date).toLocaleDateString('ar-SA')}
                           </div>
                         </div>

                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Users className="w-4 h-4" />
                             {event.current_attendees || 0}/{event.max_attendees || 0}
                           </div>
                         </div>

                         <p className="text-sm text-muted-foreground">
                           منظم بواسطة: {event.profiles?.full_name || 'منظم الفعالية'}
                         </p>
                  </div>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <div className="flex gap-2 w-full">
                  <Button asChild className="flex-1">
                    <Link to={`/event/${event.id}`}>
                      عرض التفاصيل
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link 
                      to="/checkout" 
                       state={{
                         eventId: event.id,
                         eventTitle: event.title_ar || event.title,
                         eventPrice: event.price,
                         availableSeats: (event.max_attendees || 0) - (event.current_attendees || 0)
                       }}
                    >
                      احجز الآن
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
           ))
          )}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/explore">
              عرض جميع الفعاليات
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;