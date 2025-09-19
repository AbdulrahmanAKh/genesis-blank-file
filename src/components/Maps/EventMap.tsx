import React, { useEffect, useRef, useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabaseServices } from '@/services/supabaseServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Search, 
  Filter,
  Locate,
  Route,
  Star
} from 'lucide-react';

// Note: In a real implementation, you would import mapbox-gl
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

interface EventLocation {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  rating: number;
  date: Date;
}

interface EventMapProps {
  mapboxToken?: string;
}

export const EventMap = ({ mapboxToken }: EventMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const { data: events = [], isLoading } = useSupabaseQuery({
    queryKey: ['events'],
    queryFn: () => supabaseServices.events.getAll()
  });

  const eventsToShow = events;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Mock map initialization - In real implementation:
    // mapboxgl.accessToken = mapboxToken || '';
    // map.current = new mapboxgl.Map({...})
    
    // For demonstration, we'll show a placeholder
    setIsMapReady(true);
  }, [mapboxToken]);

  const handleEventClick = (event: EventLocation) => {
    setSelectedEvent(event);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('خطأ في الحصول على الموقع:', error);
        }
      );
    }
  };

  const filteredEvents = eventsToShow.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full">
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث عن فعاليات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-white/90 backdrop-blur"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={getUserLocation}
          className="bg-white/90 backdrop-blur"
        >
          <Locate className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg bg-muted flex items-center justify-center"
      >
        {!isMapReady ? (
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">تحميل الخريطة...</p>
          </div>
        ) : (
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">الخريطة تحتاج إلى مفتاح Mapbox API</p>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredEvents.length} فعالية متاحة
            </p>
          </div>
        )}
      </div>

      {/* Event Cards Overlay */}
      {filteredEvents.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filteredEvents.slice(0, 3).map((event) => (
              <Card 
                key={event.id} 
                className="min-w-[280px] bg-white/90 backdrop-blur cursor-pointer hover:bg-white/95 transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location || 'موقع غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{event.rating || 'غير مقيم'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-primary">
                      {event.price ? `${event.price} ريال` : 'مجاني'}
                    </span>
                    <Button size="sm" variant="outline">
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="absolute top-16 right-4 z-20">
          <Card className="w-80 bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>{selectedEvent.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">موقع الفعالية</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-primary">
                    {selectedEvent.price ? `${selectedEvent.price} ريال` : 'مجاني'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedEvent.rating || 'غير مقيم'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    احجز الآن
                  </Button>
                  <Button variant="outline">
                    <Route className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};