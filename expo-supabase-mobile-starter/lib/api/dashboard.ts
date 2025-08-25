import { supabase } from '../supabase';

export interface DashboardStats {
  clients: {
    total: number;
    active: number;
    inactive: number;
    prospect: number;
  };
  quotes: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    totalValue: number;
  };
  invoices: {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    totalValue: number;
    totalOutstanding: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    trend: number; // percentage change
  };
  recentActivity: Array<{
    id: string;
    type: 'client' | 'quote' | 'invoice' | 'payment';
    title: string;
    subtitle: string;
    timestamp: string;
    amount?: number;
  }>;
}

export interface RecentActivity {
  id: string;
  type: 'client' | 'quote' | 'invoice' | 'payment';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
}

export const dashboardAPI = {
  // Get comprehensive dashboard statistics
  getStats: async (orgId: string): Promise<DashboardStats> => {
    const [
      clientStats,
      quoteStats,
      invoiceStats,
      revenueStats,
      recentActivity
    ] = await Promise.all([
      dashboardAPI.getClientStats(orgId),
      dashboardAPI.getQuoteStats(orgId),
      dashboardAPI.getInvoiceStats(orgId),
      dashboardAPI.getRevenueStats(orgId),
      dashboardAPI.getRecentActivity(orgId, 10)
    ]);

    return {
      clients: clientStats,
      quotes: quoteStats,
      invoices: invoiceStats,
      revenue: revenueStats,
      recentActivity
    };
  },

  // Get client statistics
  getClientStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to fetch client stats: ${error.message}`);
    }

    return {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      prospect: data.filter(c => c.status === 'prospect').length
    };
  },

  // Get quote statistics
  getQuoteStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('quotes')
      .select('status, total')
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to fetch quote stats: ${error.message}`);
    }

    return {
      total: data.length,
      draft: data.filter(q => q.status === 'draft').length,
      sent: data.filter(q => q.status === 'sent').length,
      accepted: data.filter(q => q.status === 'accepted').length,
      rejected: data.filter(q => q.status === 'rejected').length,
      totalValue: data.reduce((sum, q) => sum + (q.total || 0), 0)
    };
  },

  // Get invoice statistics
  getInvoiceStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('status, total, balance_due')
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to fetch invoice stats: ${error.message}`);
    }

    const now = new Date();
    const overdueInvoices = data.filter(invoice => {
      if (invoice.status !== 'sent' && invoice.status !== 'overdue') return false;
      // Check if due date is in the past (assuming due_date is stored as string)
      const dueDate = new Date((invoice as any).due_date || '');
      return dueDate < now;
    });

    return {
      total: data.length,
      draft: data.filter(i => i.status === 'draft').length,
      sent: data.filter(i => i.status === 'sent').length,
      paid: data.filter(i => i.status === 'paid').length,
      overdue: overdueInvoices.length,
      totalValue: data.reduce((sum, i) => sum + (i.total || 0), 0),
      totalOutstanding: data.reduce((sum, i) => sum + (i.balance_due || 0), 0)
    };
  },

  // Get revenue statistics
  getRevenueStats: async (orgId: string) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const { data, error } = await supabase
      .from('invoices')
      .select('total, created_at, status')
      .eq('org_id', orgId)
      .in('status', ['paid', 'sent']);

    if (error) {
      throw new Error(`Failed to fetch revenue stats: ${error.message}`);
    }

    const thisMonthRevenue = data
      .filter(invoice => new Date(invoice.created_at) >= thisMonthStart)
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    const lastMonthRevenue = data
      .filter(invoice => {
        const createdDate = new Date(invoice.created_at);
        return createdDate >= lastMonthStart && createdDate < thisMonthStart;
      })
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    const thisYearRevenue = data
      .filter(invoice => new Date(invoice.created_at) >= thisYearStart)
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    const trend = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      thisYear: thisYearRevenue,
      trend
    };
  },

  // Get recent activity
  getRecentActivity: async (orgId: string, limit: number = 10): Promise<RecentActivity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles(display_name)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }

    return data?.map(activity => {
      const actorName = (activity.profiles as any)?.display_name || 'Unknown User';
      
      let title = '';
      let subtitle = '';
      let amount: number | undefined;

      switch (activity.entity_type) {
        case 'client':
          title = `Client ${activity.action}`;
          subtitle = `by ${actorName}`;
          break;
        case 'quote':
          title = `Quote ${activity.action}`;
          subtitle = `by ${actorName}`;
          break;
        case 'invoice':
          title = `Invoice ${activity.action}`;
          subtitle = `by ${actorName}`;
          break;
        case 'payment':
          title = `Payment ${activity.action}`;
          subtitle = `by ${actorName}`;
          if ((activity.meta as any)?.amount) {
            amount = (activity.meta as any).amount;
          }
          break;
        default:
          title = `${activity.entity_type} ${activity.action}`;
          subtitle = `by ${actorName}`;
      }

      return {
        id: activity.id,
        type: activity.entity_type as 'client' | 'quote' | 'invoice' | 'payment',
        title,
        subtitle,
        timestamp: activity.created_at,
        amount
      };
    }) || [];
  },

  // Get overdue invoices
  getOverdueInvoices: async (orgId: string) => {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, email)
      `)
      .eq('org_id', orgId)
      .in('status', ['sent', 'overdue'])
      .lt('due_date', now)
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch overdue invoices: ${error.message}`);
    }

    return data || [];
  },

  // Get upcoming reminders
  getUpcomingReminders: async (orgId: string, days: number = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('org_id', orgId)
      .eq('done', false)
      .gte('due_at', new Date().toISOString())
      .lte('due_at', futureDate.toISOString())
      .order('due_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch upcoming reminders: ${error.message}`);
    }

    return data || [];
  },

  // Get quick actions based on current state
  getQuickActions: async (orgId: string) => {
    const actions = [
      { id: 'new-client', title: 'Add New Client', type: 'client' },
      { id: 'new-quote', title: 'Create Quote', type: 'quote' },
      { id: 'new-invoice', title: 'Create Invoice', type: 'invoice' },
      { id: 'record-payment', title: 'Record Payment', type: 'payment' }
    ];

    // Check for overdue invoices
    const overdueInvoices = await dashboardAPI.getOverdueInvoices(orgId);
    if (overdueInvoices.length > 0) {
      actions.push({
        id: 'overdue-invoices',
        title: `Send Reminders (${overdueInvoices.length} overdue)`,
        type: 'reminder'
      });
    }

    // Check for pending quotes
    const { data: pendingQuotes } = await supabase
      .from('quotes')
      .select('id')
      .eq('org_id', orgId)
      .eq('status', 'sent')
      .limit(5);

    if (pendingQuotes && pendingQuotes.length > 0) {
      actions.push({
        id: 'follow-up-quotes',
        title: `Follow Up Quotes (${pendingQuotes.length} sent)`,
        type: 'quote'
      });
    }

    return actions;
  },

  // Get summary for dashboard cards
  getSummary: async (orgId: string) => {
    const [clientStats, quoteStats, invoiceStats, revenueStats] = await Promise.all([
      dashboardAPI.getClientStats(orgId),
      dashboardAPI.getQuoteStats(orgId),
      dashboardAPI.getInvoiceStats(orgId),
      dashboardAPI.getRevenueStats(orgId)
    ]);

    return {
      totalClients: clientStats.total,
      activeClients: clientStats.active,
      totalQuotes: quoteStats.total,
      pendingQuotes: quoteStats.sent,
      totalInvoices: invoiceStats.total,
      outstandingInvoices: invoiceStats.totalOutstanding,
      monthlyRevenue: revenueStats.thisMonth,
      revenueTrend: revenueStats.trend
    };
  }
};
