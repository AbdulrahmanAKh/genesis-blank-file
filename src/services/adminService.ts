import { supabase } from '@/integrations/supabase/client';

export const adminService = {
  // Statistics
  async getOverviewStats() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      { count: totalUsers },
      { count: lastMonthUsers },
      { count: totalEvents },
      { count: lastMonthEvents },
      { count: totalServices },
      { data: bookingsData },
      { data: lastMonthBookings },
      { count: totalCategories },
      { count: pendingEvents },
      { count: pendingServices }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString()),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString()),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount').eq('status', 'confirmed'),
      supabase.from('bookings').select('total_amount').eq('status', 'confirmed').gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString()),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const pendingReviewsCount = (pendingEvents || 0) + (pendingServices || 0);

    const totalRevenue = bookingsData?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
    const lastMonthRevenue = lastMonthBookings?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;

    const userGrowth = lastMonthUsers ? ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : '0';
    const eventGrowth = lastMonthEvents ? ((totalEvents - lastMonthEvents) / lastMonthEvents * 100).toFixed(1) : '0';
    const revenueGrowth = lastMonthRevenue ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '0';

    return {
      totalUsers: totalUsers || 0,
      userGrowth: `${userGrowth}%`,
      totalEvents: totalEvents || 0,
      eventGrowth: `${eventGrowth}%`,
      totalServices: totalServices || 0,
      totalRevenue,
      revenueGrowth: `${revenueGrowth}%`,
      activeBookings: bookingsData?.length || 0,
      totalCategories: totalCategories || 0,
      pendingReviews: pendingReviewsCount || 0
    };
  },

  // Users Management
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role),
        user_wallets(balance, total_earned)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserRole(userId: string, role: 'attendee' | 'organizer' | 'provider' | 'admin') {
    // First check if role exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRole) {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);
      if (error) throw error;
    }
  },

  // Categories Management
  async createCategory(data: { name: string; name_ar: string; description?: string; description_ar?: string; icon_name?: string }) {
    const { error } = await supabase
      .from('categories')
      .insert(data);
    if (error) throw error;
  },

  async updateCategory(id: string, data: any) {
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Financial Reports
  async getFinancialReports() {
    const { data } = await supabase
      .from('payments')
      .select('amount, created_at, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    const monthlyRevenue = data?.reduce((acc: any, payment) => {
      const month = new Date(payment.created_at).toLocaleString('ar-SA', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + Number(payment.amount);
      return acc;
    }, {});

    return Object.entries(monthlyRevenue || {}).map(([month, amount]) => ({ month, amount }));
  },

  async getStuckPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*, bookings(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);

    return data || [];
  },

  async retryPayment(paymentId: string) {
    // This would integrate with your payment processor
    const { error } = await supabase
      .from('payments')
      .update({ status: 'processing' })
      .eq('id', paymentId);
    if (error) throw error;
  },

  // System Logs
  async getSystemLogs(limit = 50) {
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  },

  async clearSystemLogs() {
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
  },

  // System Settings
  async getSystemSettings() {
    const { data } = await supabase
      .from('system_settings')
      .select('*');

    return data?.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {}) || {};
  },

  async updateSystemSetting(key: string, value: any) {
    const { error } = await supabase
      .from('system_settings')
      .update({ value })
      .eq('key', key);
    if (error) throw error;
  },

  // Send Notifications
  async sendNotification(data: { userIds: string[]; title: string; message: string; type: string }) {
    const notifications = data.userIds.map(userId => ({
      user_id: userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (error) throw error;
  },

  async sendBulkNotification(data: { title: string; message: string; type: string; role?: 'attendee' | 'organizer' | 'provider' | 'admin' }) {
    let userIds: string[] = [];
    
    if (data.role) {
      // Get users by role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', data.role);
      userIds = userRoles?.map(u => u.user_id) || [];
    } else {
      // Get all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id');
      userIds = profiles?.map(p => p.user_id) || [];
    }

    if (userIds.length > 0) {
      await this.sendNotification({
        userIds,
        title: data.title,
        message: data.message,
        type: data.type
      });
    }
  }
};
