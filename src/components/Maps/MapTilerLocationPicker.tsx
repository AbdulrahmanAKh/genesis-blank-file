import { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

interface MapTilerLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const MAPTILER_API_KEY = 'YOUR_MAPTILER_API_KEY'; // Will be replaced with actual key

export const MapTilerLocationPicker = ({ 
  onLocationSelect, 
  initialLat = 24.7136, 
  initialLng = 46.6753 
}: MapTilerLocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: initialLat,
    lng: initialLng,
    address: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    maptilersdk.config.apiKey = MAPTILER_API_KEY;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [initialLng, initialLat],
      zoom: 12
    });

    // Add initial marker
    marker.current = new maptilersdk.Marker({ draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      updateLocation(lngLat.lat, lngLat.lng);
    });

    // Handle map click
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      }
      updateLocation(lat, lng);
    });

    // Initial reverse geocode
    reverseGeocode(initialLng, initialLat);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`
      );
      const data = await response.json();
      const address = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lng, lat);
    setSelectedLocation({ lat, lng, address });
    onLocationSelect(lat, lng, address);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map.current) return;

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_API_KEY}&language=ar`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Update map view
        map.current.flyTo({ center: [lng, lat], zoom: 14 });
        
        // Update marker
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        
        updateLocation(lat, lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن موقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} type="button">
            بحث
          </Button>
        </div>
        
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border"
        />
        
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium mb-1">الموقع المحدد:</p>
            <p className="text-muted-foreground">
              {selectedLocation.address || 'انقر على الخريطة لتحديد الموقع'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          💡 انقر على الخريطة أو اسحب العلامة لتحديد الموقع
        </p>
      </CardContent>
    </Card>
  );
};
