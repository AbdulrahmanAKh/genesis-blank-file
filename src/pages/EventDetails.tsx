import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  Target, 
  DollarSign,
  Share2,
  Heart,
  Shield,
  MessageCircle,
  ChevronLeft,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { supabaseServices } from "@/services/supabaseServices";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: event, isLoading } = useSupabaseQuery({
    queryKey: ['event', id],
    queryFn: () => supabaseServices.events.getById(id || ''),
    enabled: !!id
  });

  // If event not found, redirect to explore page
  useEffect(() => {
    if (!event) {
      navigate('/explore');
    }
  }, [event, navigate]);

  if (!event) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "سهل": return "bg-green-100 text-green-800";
      case "متوسط": return "bg-yellow-100 text-yellow-800";
      case "صعب": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link to="/explore">
              <ChevronLeft className="w-4 h-4 ml-2" />
              العودة للفعاليات
            </Link>
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute top-6 right-6 flex gap-3">
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className={getDifficultyColor(event.difficulty)}>
                  {event.difficulty}
                </Badge>
                <Badge variant="secondary">{event.category}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{event.rating}</span>
                  <span className="text-muted-foreground">({event.reviewsCount} تقييم)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {event.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {event.currentParticipants}/{event.maxParticipants} مشارك
                </div>
              </div>
            </div>

            {/* Organizer */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={event.organizer.avatar} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.organizer.name}</h3>
                        {event.organizer.verified && (
                          <Shield className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {event.organizer.rating}
                        </div>
                        <span>{event.organizer.eventsCount} فعالية</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 ml-2" />
                    تواصل
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>وصف الفعالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
                
                <div>
                  <h4 className="font-semibold mb-3">ما يميز هذه الفعالية:</h4>
                  <ul className="space-y-2">
                    {event.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>ما هو مشمول؟</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>المتطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>التقييمات ({event.reviewsCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{review.user}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                    {review.id !== event.reviews[event.reviews.length - 1].id && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{event.price}</span>
                  <span className="text-muted-foreground">ريال</span>
                  <span className="text-sm text-muted-foreground">/ شخص</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التاريخ:</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الوقت:</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المدة:</span>
                    <span>{event.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المقاعد المتبقية:</span>
                    <span className="font-medium text-primary">
                      {event.maxParticipants - event.currentParticipants}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link 
                    to="/checkout" 
                    state={{
                      eventId: event.id,
                      eventTitle: event.title,
                      eventPrice: event.price,
                      availableSeats: event.maxParticipants - event.currentParticipants
                    }}
                  >
                    احجز الآن
                  </Link>
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  {event.cancellationPolicy}
                </p>
              </CardContent>
            </Card>

            {/* Meeting Point */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نقطة التجمع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1" />
                    <span className="text-sm">{event.meetingPoint}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-1" />
                    <span className="text-sm">{event.meetingTime}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  عرض على الخريطة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;