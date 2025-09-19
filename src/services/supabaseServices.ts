import { supabase } from '@/integrations/supabase/client';

// Events Services
export const eventsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), profiles!events_organizer_id_fkey(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), profiles!events_organizer_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return { data };
  },

  getByOrganizer: async (organizerId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*)')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  create: async (eventData: any) => {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  update: async (id: string, eventData: any) => {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: null };
  },

  search: async (query: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), profiles!events_organizer_id_fkey(*)')
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },
};

// Services Services
export const servicesService = {
  getAll: () =>
    supabase
      .from('services')
      .select('*, categories(*), profiles!services_provider_id_fkey(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),

  getById: (id: string) =>
    supabase
      .from('services')
      .select('*, categories(*), profiles!services_provider_id_fkey(*)')
      .eq('id', id)
      .single(),

  getByProvider: (providerId: string) =>
    supabase
      .from('services')
      .select('*, categories(*)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false }),

  create: (serviceData: any) =>
    supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single(),

  update: (id: string, serviceData: any) =>
    supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single(),

  delete: (id: string) =>
    supabase
      .from('services')
      .delete()
      .eq('id', id),

  search: (query: string) =>
    supabase
      .from('services')
      .select('*, categories(*), profiles!services_provider_id_fkey(*)')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
};

// Categories Services
export const categoriesService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return { data: data || [] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return { data };
  },

  create: async (categoryData: any) => {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  update: async (id: string, categoryData: any) => {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: null };
  },
};

// Bookings Services
export const bookingsService = {
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getByEvent: async (eventId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_user_id_fkey(*)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  create: async (bookingData: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  update: async (id: string, bookingData: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  cancel: async (id: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },
};

// Profiles Services
export const profilesService = {
  getByUserId: (userId: string) =>
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),

  update: (userId: string, profileData: any) =>
    supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single(),

  create: (profileData: any) =>
    supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single(),
};

// User Roles Services
export const userRolesService = {
  getByUserId: (userId: string) =>
    supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single(),

  update: (userId: string, role: 'attendee' | 'organizer' | 'provider' | 'admin') =>
    supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single(),

  create: (roleData: any) =>
    supabase
      .from('user_roles')
      .insert(roleData)
      .select()
      .single(),
};

// Notifications Services
export const notificationsService = {
  getByUserId: (userId: string) =>
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  markAsRead: (id: string) =>
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id),

  markAllAsRead: (userId: string) =>
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId),
};

// Wallet Services
export const walletService = {
  getByUserId: (userId: string) =>
    supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single(),

  getTransactions: (userId: string) =>
    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
};

// Loyalty Points Services
export const loyaltyService = {
  getPointsByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getTotalPoints: async (userId: string) => {
    const { data, error } = await supabase
      .from('loyalty_ledger')
      .select('points')
      .eq('user_id', userId);
    if (error) throw error;
    return { data: data || [] };
  },
};

// Reviews Services
export const reviewsService = {
  getByEventId: (eventId: string) =>
    supabase
      .from('reviews')
      .select('*, profiles!reviews_user_id_fkey(*)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false }),

  getByServiceId: (serviceId: string) =>
    supabase
      .from('reviews')
      .select('*, profiles!reviews_user_id_fkey(*)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false }),

  create: (reviewData: any) =>
    supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single(),
};

// Updated Services Structure
const events = {
  getByOrganizer: async (organizerId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId);
    if (error) throw error;
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), profiles!events_organizer_id_fkey(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

const bookings = {
  getByOrganizer: async (organizerId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events!inner(*)')
      .eq('events.organizer_id', organizerId);
    if (error) throw error;
    return data || [];
  },
  getByEvent: async (eventId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_user_id_fkey(*)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};

const profiles = {};
const services = {};

const groups = {
  getRegionGroups: async () => {
    const { data, error } = await supabase
      .from('event_groups')
      .select('*')
      .eq('group_type', 'region');
    if (error) throw error;
    return data || [];
  },
  getEventGroups: async (userId: string) => {
    const { data, error } = await supabase
      .from('event_groups')
      .select('*')
      .eq('group_type', 'event');
    if (error) throw error;
    return data || [];
  }
};

const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const supabaseServices = { 
  events: {
    ...events,
    getAll: async () => {
      return await eventsService.getAll();
    }
  },
  bookings: {
    ...bookings,
    getByUserId: async (userId: string) => {
      const data = await bookings.getByUserId(userId);
      return { data };
    }
  },
  profiles, 
  services, 
  groups, 
  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  },
  notificationsService: {
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [] };
    },
    markAsRead: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')  
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    markAllAsRead: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })  
        .eq('user_id', userId);
      if (error) throw error;
    }
  },
  supabase
};