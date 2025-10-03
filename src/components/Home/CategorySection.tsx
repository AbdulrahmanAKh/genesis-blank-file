import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/empty-state';
import { 
  Mountain, 
  Waves, 
  Tent, 
  Bike, 
  TreePine, 
  Zap,
  Car,
  Wind,
  Compass,
  Trophy,
  Palmtree,
  Plane,
  Footprints,
  Flame,
  Camera,
  Target,
  Anchor,
  Snowflake,
  Sun,
  Leaf
} from 'lucide-react';
import { categoriesService, statisticsService, eventsService } from '@/services/supabaseServices';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Import category images
import mountainImg from '@/assets/categories/mountain.jpg';
import wavesImg from '@/assets/categories/waves.jpg';
import campingImg from '@/assets/categories/camping.jpg';
import bikingImg from '@/assets/categories/biking.jpg';
import desertImg from '@/assets/categories/desert.jpg';
import beachImg from '@/assets/categories/beach.jpg';
import snowImg from '@/assets/categories/snow.jpg';
import hikingImg from '@/assets/categories/hiking.jpg';
import forestImg from '@/assets/categories/forest.jpg';
import offroadImg from '@/assets/categories/offroad.jpg';
import airsportsImg from '@/assets/categories/airsports.jpg';
import kayakingImg from '@/assets/categories/kayaking.jpg';
import climbingImg from '@/assets/categories/climbing.jpg';
import safariImg from '@/assets/categories/safari.jpg';
import caveImg from '@/assets/categories/cave.jpg';
import archeryImg from '@/assets/categories/archery.jpg';

// Icon mapping with proper adventure icons
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain,
  Waves,
  Tent,
  Bike,
  TreePine,
  Zap,
  Car,
  Wind,
  Compass,
  Trophy,
  Palmtree,
  Plane,
  Footprints,
  Flame,
  Camera,
  Target,
  Anchor,
  Snowflake,
  Sun,
  Leaf
};

// Default icon assignment per category type
const getCategoryIcon = (categoryName: string): React.ComponentType<{ className?: string }> => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('جبل') || name.includes('تسلق')) return Mountain;
  if (name.includes('بحر') || name.includes('غوص') || name.includes('سباحة')) return Waves;
  if (name.includes('تخييم') || name.includes('خيمة')) return Tent;
  if (name.includes('دراج') || name.includes('سيكل')) return Bike;
  if (name.includes('غاب') || name.includes('طبيعة')) return TreePine;
  if (name.includes('سرع') || name.includes('قيادة')) return Zap;
  if (name.includes('سيارة') || name.includes('طرق')) return Car;
  if (name.includes('رياح') || name.includes('طيران')) return Wind;
  if (name.includes('استكشاف') || name.includes('مغامرة')) return Compass;
  if (name.includes('صحراء') || name.includes('رمل')) return Sun;
  if (name.includes('ثلج') || name.includes('تزلج')) return Snowflake;
  if (name.includes('شاطئ') || name.includes('نخل')) return Palmtree;
  if (name.includes('طيران') || name.includes('سفر')) return Plane;
  if (name.includes('مشي') || name.includes('رحلة')) return Footprints;
  if (name.includes('نار') || name.includes('شواء')) return Flame;
  if (name.includes('تصوير') || name.includes('صور')) return Camera;
  if (name.includes('رماية') || name.includes('هدف')) return Target;
  if (name.includes('قارب') || name.includes('بحرية')) return Anchor;
  if (name.includes('زراع') || name.includes('أخضر')) return Leaf;
  
  return Trophy;
};

// Get category color based on category name
const getCategoryColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('جبل') || name.includes('تسلق')) return 'bg-slate-500';
  if (name.includes('بحر') || name.includes('غوص') || name.includes('سباحة')) return 'bg-blue-500';
  if (name.includes('تخييم') || name.includes('خيمة')) return 'bg-green-600';
  if (name.includes('دراج') || name.includes('سيكل')) return 'bg-orange-500';
  if (name.includes('غاب') || name.includes('طبيعة')) return 'bg-emerald-600';
  if (name.includes('سرع') || name.includes('قيادة')) return 'bg-yellow-500';
  if (name.includes('سيارة') || name.includes('طرق')) return 'bg-gray-600';
  if (name.includes('رياح') || name.includes('طيران')) return 'bg-sky-400';
  if (name.includes('استكشاف') || name.includes('مغامرة')) return 'bg-purple-500';
  if (name.includes('صحراء') || name.includes('رمل')) return 'bg-amber-500';
  if (name.includes('ثلج') || name.includes('تزلج')) return 'bg-cyan-400';
  if (name.includes('شاطئ') || name.includes('نخل')) return 'bg-teal-500';
  if (name.includes('طيران') || name.includes('سفر')) return 'bg-indigo-500';
  if (name.includes('مشي') || name.includes('رحلة')) return 'bg-lime-600';
  if (name.includes('نار') || name.includes('شواء')) return 'bg-red-500';
  if (name.includes('تصوير') || name.includes('صور')) return 'bg-pink-500';
  if (name.includes('رماية') || name.includes('هدف')) return 'bg-rose-600';
  if (name.includes('قارب') || name.includes('بحرية')) return 'bg-blue-600';
  if (name.includes('زراع') || name.includes('أخضر')) return 'bg-green-500';
  
  return 'bg-primary';
};

// Get category image based on category name
const getCategoryImage = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  // Climbing & Mountains
  if (name.includes('جبل') || name.includes('تسلق') || name.includes('صعود')) return climbingImg;
  
  // Water activities
  if (name.includes('بحر') || name.includes('غوص') || name.includes('سباحة') || name.includes('ماء')) return wavesImg;
  if (name.includes('قارب') || name.includes('بحرية') || name.includes('تجديف') || name.includes('كاياك')) return kayakingImg;
  
  // Camping
  if (name.includes('تخييم') || name.includes('خيمة') || name.includes('مخيم')) return campingImg;
  
  // Biking
  if (name.includes('دراج') || name.includes('سيكل') || name.includes('هوائي')) return bikingImg;
  
  // Desert & Safari
  if (name.includes('صحراء') || name.includes('رمل') || name.includes('كثبان')) return desertImg;
  if (name.includes('سفاري') || name.includes('حيوانات') || name.includes('برية')) return safariImg;
  
  // Snow & Winter
  if (name.includes('ثلج') || name.includes('تزلج') || name.includes('شتاء')) return snowImg;
  
  // Beach
  if (name.includes('شاطئ') || name.includes('نخل') || name.includes('ساحل')) return beachImg;
  
  // Hiking & Walking
  if (name.includes('مشي') || name.includes('رحلة') || name.includes('تنزه') || name.includes('سير')) return hikingImg;
  
  // Forest & Nature
  if (name.includes('غاب') || name.includes('طبيعة') || name.includes('أشجار') || name.includes('حرجي')) return forestImg;
  
  // Off-road & Racing
  if (name.includes('سرع') || name.includes('قيادة') || name.includes('سباق') || name.includes('رالي')) return offroadImg;
  if (name.includes('سيارة') || name.includes('طرق') || name.includes('دفع رباعي')) return offroadImg;
  
  // Air sports
  if (name.includes('رياح') || name.includes('طيران') || name.includes('هواء') || name.includes('شراع')) return airsportsImg;
  if (name.includes('مظل') || name.includes('قفز') || name.includes('طائر')) return airsportsImg;
  
  // Exploration & Adventure
  if (name.includes('استكشاف') || name.includes('مغامرة') || name.includes('اكتشاف')) return safariImg;
  
  // Fire & BBQ
  if (name.includes('نار') || name.includes('شواء') || name.includes('طبخ')) return campingImg;
  
  // Archery & Target
  if (name.includes('رماية') || name.includes('هدف') || name.includes('نشاب') || name.includes('قوس')) return archeryImg;
  
  // Cave exploration
  if (name.includes('كهف') || name.includes('مغار') || name.includes('كهوف')) return caveImg;
  
  // Default fallback
  return mountainImg;
};

interface Category {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  icon_name?: string;
  color_start?: string;
  color_end?: string;
  event_count: number;
}

interface Statistic {
  id: string;
  stat_key: string;
  stat_value_ar: string;
  description_ar?: string;
  icon_name?: string;
  display_order: number;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);
  const [slidesToScroll, setSlidesToScroll] = useState(4);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResponse, statisticsResponse, eventsResponse] = await Promise.all([
        categoriesService.getAll(),
        statisticsService.getAll(),
        eventsService.getAll()
      ]);

      if (categoriesResponse.error) throw categoriesResponse.error;
      if (statisticsResponse.error) throw statisticsResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      // Count total events per category (not just available ones)
      const allEvents = eventsResponse.data || [];
      const categoriesWithCounts = (categoriesResponse.data || []).map(category => {
        const totalEventCount = allEvents.filter(event => event.category_id === category.id).length;
        return {
          ...category,
          event_count: totalEventCount
        };
      });

      setCategories(categoriesWithCounts);
      setStatistics(statisticsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Track carousel API and current slide
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Update visible items and slides to scroll based on screen size
  useEffect(() => {
    const updateCarouselSettings = () => {
      const width = window.innerWidth;
      let items = 4;
      if (width < 640) items = 1;      // mobile
      else if (width < 768) items = 2; // sm
      else if (width < 1024) items = 3; // md
      
      setVisibleItems(items);
      setSlidesToScroll(items); // Match scroll to visible
    };
    
    updateCarouselSettings();
    window.addEventListener('resize', updateCarouselSettings);
    return () => window.removeEventListener('resize', updateCarouselSettings);
  }, []);

  const getIconComponent = (iconName?: string, categoryName?: string): React.ComponentType<{ className?: string }> => {
    // First check if custom icon name exists in iconMap
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    // Then check category name for smart icon selection
    if (categoryName) {
      return getCategoryIcon(categoryName);
    }
    // Default fallback
    return Trophy;
  };

  const getGradientClass = (colorStart?: string, colorEnd?: string) => {
    // Ensure colors are valid or return default
    if (!colorStart || !colorEnd) {
      return 'bg-gradient-to-r from-primary/80 to-primary';
    }
    
    // Return the gradient using the color values directly
    return `bg-gradient-to-r from-${colorStart}-500 to-${colorEnd}-600`;
  };

  if (loading) {
    return (
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              تصنيفات المغامرات
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة متنوعة من الأنشطة والمغامرات التي تناسب جميع المستويات والاهتمامات
            </p>
          </div>
          <LoadingState 
            title="جاري تحميل التصنيفات..." 
            description="يرجى الانتظار بينما نقوم بتحميل جميع تصنيفات المغامرات المتاحة"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              تصنيفات المغامرات
            </h2>
          </div>
          <ErrorState 
            title="خطأ في تحميل التصنيفات"
            description={error}
            onRetry={fetchData}
          />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              تصنيفات المغامرات
            </h2>
          </div>
          <EmptyState
            icon={Trophy}
            title="لا توجد تصنيفات متاحة حالياً"
            description="لم نتمكن من العثور على أي تصنيفات للمغامرات في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً أو تصفح الفعاليات مباشرة."
            actionLabel="تصفح الفعاليات"
            onAction={() => window.location.href = '/explore'}
            showRetry
            onRetry={fetchData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            تصنيفات المغامرات
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اكتشف مجموعة متنوعة من الأنشطة والمغامرات التي تناسب جميع المستويات والاهتمامات
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-12">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon_name, category.name_ar);
            const colorClass = getCategoryColor(category.name_ar);
            
            return (
              <Link 
                key={category.id} 
                to={`/explore?category=${category.id}`}
                className="group"
              >
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 smooth-transition">
                  <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center group-hover:scale-110 smooth-transition shadow-sm`}>
                    {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="font-medium text-xs text-center group-hover:text-primary smooth-transition line-clamp-2">
                    {category.name_ar}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {category.event_count}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured Categories Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: slidesToScroll,
              skipSnaps: false,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent>
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon_name, category.name_ar);
                const categoryImage = getCategoryImage(category.name_ar);
                
                return (
                  <CarouselItem key={category.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Card className="group overflow-hidden hover:shadow-xl smooth-transition h-full">
                      <Link to={`/explore?category=${category.id}`}>
                        <div className="relative">
                          <div className="w-full h-48 relative overflow-hidden">
                            <img 
                              src={categoryImage} 
                              alt={category.name_ar}
                              className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg">
                              {IconComponent && <IconComponent className="w-7 h-7 text-white drop-shadow-lg" />}
                            </div>
                          </div>
                          <div className="absolute bottom-4 right-4 left-4 text-white">
                            <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{category.name_ar}</h3>
                            <p className="text-sm opacity-90 line-clamp-2 drop-shadow-md">{category.description_ar || 'استكشف أفضل الفعاليات'}</p>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground smooth-transition">
                                {category.event_count} فعالية
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              استكشف
                            </Button>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background" />
            <CarouselNext className="right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background" />
          </Carousel>

          {/* Dynamic Counter */}
          <div className="text-center mt-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">
                عرض {currentSlide + 1}-{Math.min(currentSlide + visibleItems, categories.length)}
              </span>
              {' من '}
              <span className="font-medium">{categories.length}</span>
              {' تصنيف'}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="dark:bg-primary/20 dark:border-primary/40 dark:hover:bg-primary/30 dark:text-white" asChild>
            <Link to="/explore">
              <Trophy className="w-4 h-4 ml-2" />
              عرض جميع التصنيفات
            </Link>
          </Button>
        </div>

        {/* Stats Section */}
        {statistics.length > 0 && (
          <div className="mt-16 bg-primary dark:bg-primary rounded-2xl p-8 shadow-lg dark:shadow-glow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {statistics.map((stat) => (
                <div key={stat.id}>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.stat_value_ar}
                  </div>
                  <p className="text-sm text-white/90">
                    {stat.description_ar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
