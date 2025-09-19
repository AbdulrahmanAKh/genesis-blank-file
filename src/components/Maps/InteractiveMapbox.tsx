import React, { useRef, useEffect, useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabaseServices } from '@/services/supabaseServices';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { MapPin, Navigation, Search, Layers, Filter, Route } from 'lucide-react';

interface EventLocation {
  id: string;
  title: string;
  title_ar: string;
  category: string;
  location: [number, number]; // [longitude, latitude]
  price: number;
  rating: number;
  date: string;
  difficulty?: string;
  duration?: string;
}

interface InteractiveMapboxProps {
  mapboxToken?: string;
}

const InteractiveMapbox = ({ mapboxToken }: InteractiveMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(46.6753);
  const [lat, setLat] = useState(24.7136);
  const [zoom, setZoom] = useState(6);
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { t, isRTL } = useLanguageContext();
  const { toast } = useToast();

  const { data: events = [], isLoading } = useSupabaseQuery({
    queryKey: ['events'],
    queryFn: () => supabaseServices.events.getAll()
  });

  const displayEvents = events;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if API key is provided
    if (!apiKey) {
      return;
    }

    try {
      mapboxgl.accessToken = apiKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      
      map.current.addControl(geolocate, 'top-right');

      // Update coordinates on move
      map.current.on('move', () => {
        if (map.current) {
          setLng(Number(map.current.getCenter().lng.toFixed(4)));
          setLat(Number(map.current.getCenter().lat.toFixed(4)));
          setZoom(Number(map.current.getZoom().toFixed(2)));
        }
      });

      // Add event markers
      displayEvents.forEach((event) => {
        if (event.longitude && event.latitude) {
          const marker = new mapboxgl.Marker({
            color: '#0ea5e9'
          })
            .setLngLat([event.longitude, event.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">${isRTL ? event.title_ar || event.title : event.title}</h3>
                    <p class="text-xs text-gray-600 mt-1">${event.category}</p>
                    <p class="text-xs font-semibold text-blue-600 mt-1">${event.price ? `${event.price} SAR` : 'Free'}</p>
                  </div>
                `)
            );

          if (map.current) {
            marker.addTo(map.current);
          }

          // Add click event to marker
          marker.getElement().addEventListener('click', () => {
            setSelectedEvent(event);
          });
        }
      });

    } catch (error) {
      console.error('Mapbox initialization error:', error);
      toast({
        title: 'خطأ في الخريطة',
        description: 'فشل في تحميل الخريطة. تحقق من مفتاح API.',
        variant: 'destructive'
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [apiKey, mapStyle, displayEvents, isRTL, toast]);

  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
    if (map.current) {
      map.current.setStyle(newStyle);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoords);
          
          if (map.current) {
            map.current.flyTo({
              center: userCoords,
              zoom: 12
            });
          }
        },
        (error) => {
          toast({
            title: 'خطأ في الموقع',
            description: 'فشل في الحصول على موقعك الحالي',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const filteredEvents = displayEvents.filter(event => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchTerm) ||
      event.title_ar?.toLowerCase().includes(searchTerm) ||
      event.category?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('searchEvents', 'البحث عن فعاليات...')}
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
            <Navigation className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-white/90 backdrop-blur"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* API Key Input (if not provided) */}
        {!apiKey && (
          <div className="flex gap-2">
            <Input
              placeholder="Mapbox Access Token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white/90 backdrop-blur"
            />
            <Button variant="outline" className="bg-white/90 backdrop-blur">
              تحميل
            </Button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />

      {/* Map Info */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              <div>خط الطول: {lng} | خط العرض: {lat}</div>
              <div>مستوى التكبير: {zoom}</div>
              <div>الفعاليات: {filteredEvents.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Style Selector */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant={mapStyle.includes('satellite') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleStyleChange('mapbox://styles/mapbox/satellite-streets-v12')}
              >
                قمر صناعي
              </Button>
              <Button
                variant={mapStyle.includes('streets') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleStyleChange('mapbox://styles/mapbox/streets-v12')}
              >
                شوارع
              </Button>
              <Button
                variant={mapStyle.includes('outdoors') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleStyleChange('mapbox://styles/mapbox/outdoors-v12')}
              >
                خارجي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="absolute bottom-4 right-4 z-20">
          <Card className="w-80 bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {isRTL ? selectedEvent.title_ar || selectedEvent.title : selectedEvent.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedEvent.category}</Badge>
                  {selectedEvent.difficulty && (
                    <Badge variant="secondary">{selectedEvent.difficulty}</Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-primary">
                    {selectedEvent.price ? `${selectedEvent.price} ريال` : 'مجاني'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedEvent.duration}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">
                    {t('bookNow', 'احجز الآن')}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Route className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No API Key Message */}
      {!apiKey && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                Mapbox Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                To display the interactive map, please provide your Mapbox access token.
              </p>
              <p className="text-sm text-muted-foreground">
                {filteredEvents.length} events are ready to be displayed.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapbox;