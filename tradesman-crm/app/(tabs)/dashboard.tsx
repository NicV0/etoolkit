import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface DashboardStats {
  activeJobs: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalClients: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'job' | 'invoice' | 'client';
  title: string;
  subtitle: string;
  status: string;
  date: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalClients: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load stats
      const [jobsResult, invoicesResult, clientsResult] = await Promise.all([
        supabase.from('jobs').select('*').eq('user_id', user.id),
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('clients').select('*').eq('user_id', user.id),
      ]);

      const jobs = jobsResult.data || [];
      const invoices = invoicesResult.data || [];
      const clients = clientsResult.data || [];

      const activeJobs = jobs.filter(j => j.status === 'in_progress').length;
      const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
      const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
      const monthlyRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0);

      setStats({
        activeJobs,
        pendingInvoices,
        overdueInvoices,
        totalClients: clients.length,
        monthlyRevenue,
      });

      // Create recent activity
      const activity: RecentActivity[] = [
        ...jobs.slice(0, 3).map(job => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          subtitle: `Due: ${new Date(job.deadline).toLocaleDateString()}`,
          status: job.status,
          date: job.created_at,
        })),
        ...invoices.slice(0, 3).map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          title: `Invoice #${invoice.invoice_number}`,
          subtitle: `$${invoice.total_amount.toFixed(2)}`,
          status: invoice.status,
          date: invoice.created_at,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return '#34C759';
      case 'in_progress':
      case 'sent':
        return '#007AFF';
      case 'overdue':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job':
        return 'hammer-outline';
      case 'invoice':
        return 'receipt-outline';
      case 'client':
        return 'person-outline';
      default:
        return 'document-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.businessName}>Your Business</Text>
        </View>
        <Pressable onPress={handleSignOut} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingInvoices}</Text>
            <Text style={styles.statLabel}>Pending Invoices</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {stats.overdueInvoices}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
        </View>

        {/* Monthly Revenue */}
        <Card>
          <View style={styles.revenueHeader}>
            <Text style={styles.sectionTitle}>Monthly Revenue</Text>
            <Text style={styles.revenueAmount}>
              ${stats.monthlyRevenue.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(item.type) as any}
                    size={20}
                    color="#007AFF"
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.activityStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="New Client"
              onPress={() => {}}
              variant="outline"
              style={styles.quickActionButton}
            />
            <Button
              title="Create Invoice"
              onPress={() => {}}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});