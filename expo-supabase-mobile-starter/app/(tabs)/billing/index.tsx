import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Receipt, 
  FileText, 
  DollarSign,
  Plus,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings
} from 'lucide-react-native';
import { designSystem } from '../../../theme/design-system';

export default function BillingScreen() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('quotes');

  // Mock data - keeping all existing functionality
  const quotes = [
    {
      id: '1',
      number: 'Q-0001',
      clientName: 'Acme Plumbing',
      amount: 2500,
      status: 'sent',
      date: '2024-01-15',
      dueDate: '2024-02-15',
    },
    {
      id: '2',
      number: 'Q-0002',
      clientName: 'Green Leaf HVAC',
      amount: 1800,
      status: 'draft',
      date: '2024-01-14',
      dueDate: null,
    },
    {
      id: '3',
      number: 'Q-0003',
      clientName: 'Sunny Electrical',
      amount: 3200,
      status: 'accepted',
      date: '2024-01-13',
      dueDate: '2024-02-13',
    },
  ];

  const invoices = [
    {
      id: '1',
      number: 'INV-0001',
      clientName: 'Acme Plumbing',
      amount: 2500,
      paid: 1500,
      status: 'partial',
      date: '2024-01-10',
      dueDate: '2024-02-10',
    },
    {
      id: '2',
      number: 'INV-0002',
      clientName: 'Green Leaf HVAC',
      amount: 1800,
      paid: 1800,
      status: 'paid',
      date: '2024-01-08',
      dueDate: '2024-02-08',
    },
    {
      id: '3',
      number: 'INV-0003',
      clientName: 'Sunny Electrical',
      amount: 3200,
      paid: 0,
      status: 'overdue',
      date: '2024-01-05',
      dueDate: '2024-02-05',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'partial':
        return designSystem.colors.warning[500];
      case 'accepted':
      case 'paid':
        return designSystem.colors.success[500];
      case 'draft':
        return designSystem.colors.gray[500];
      case 'overdue':
        return designSystem.colors.error[500];
      default:
        return designSystem.colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'partial':
        return <Clock size={16} color={designSystem.colors.warning[500]} />;
      case 'accepted':
      case 'paid':
        return <CheckCircle size={16} color={designSystem.colors.success[500]} />;
      case 'draft':
        return <FileText size={16} color={designSystem.colors.gray[500]} />;
      case 'overdue':
        return <AlertCircle size={16} color={designSystem.colors.error[500]} />;
      default:
        return <FileText size={16} color={designSystem.colors.gray[500]} />;
    }
  };

  const renderQuoteCard = (quote: typeof quotes[0]) => (
    <Pressable
      key={quote.id}
      onPress={() => router.push(`/billing/quotes/${quote.id}`)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: designSystem.borderRadius.xl,
        padding: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: designSystem.borderRadius.lg,
            backgroundColor: designSystem.colors.primary[50],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: designSystem.spacing.md,
          }}>
            <FileText size={24} color={designSystem.colors.primary[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: designSystem.typography.fontSize.base,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
              marginBottom: designSystem.spacing.xs,
            }}>
              {quote.number}
            </Text>
            <Text style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.secondary,
              marginBottom: designSystem.spacing.xs,
            }}>
              {quote.clientName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={12} color={designSystem.colors.text.tertiary} />
              <Text style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: designSystem.colors.text.tertiary,
                marginLeft: designSystem.spacing.xs,
              }}>
                {formatDate(quote.date)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${getStatusColor(quote.status)}20`,
            paddingHorizontal: designSystem.spacing.sm,
            paddingVertical: designSystem.spacing.xs,
            borderRadius: designSystem.borderRadius.full,
            marginBottom: designSystem.spacing.xs,
          }}>
            {getStatusIcon(quote.status)}
            <Text style={{
              fontSize: designSystem.typography.fontSize.xs,
              fontWeight: designSystem.typography.fontWeight.medium,
              color: getStatusColor(quote.status),
              marginLeft: designSystem.spacing.xs,
              textTransform: 'uppercase',
            }}>
              {quote.status}
            </Text>
          </View>
          <Text style={{
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary,
          }}>
            {formatCurrency(quote.amount)}
          </Text>
          <ChevronRight size={16} color={designSystem.colors.gray[400]} />
        </View>
      </View>
    </Pressable>
  );

  const renderInvoiceCard = (invoice: typeof invoices[0]) => (
    <Pressable
      key={invoice.id}
      onPress={() => router.push(`/billing/invoices/${invoice.id}`)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: designSystem.borderRadius.xl,
        padding: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: designSystem.borderRadius.lg,
            backgroundColor: designSystem.colors.success[50],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: designSystem.spacing.md,
          }}>
                         <Receipt size={24} color={designSystem.colors.success[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: designSystem.typography.fontSize.base,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
              marginBottom: designSystem.spacing.xs,
            }}>
              {invoice.number}
            </Text>
            <Text style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.secondary,
              marginBottom: designSystem.spacing.xs,
            }}>
              {invoice.clientName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={12} color={designSystem.colors.text.tertiary} />
              <Text style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: designSystem.colors.text.tertiary,
                marginLeft: designSystem.spacing.xs,
              }}>
                {formatDate(invoice.date)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${getStatusColor(invoice.status)}20`,
            paddingHorizontal: designSystem.spacing.sm,
            paddingVertical: designSystem.spacing.xs,
            borderRadius: designSystem.borderRadius.full,
            marginBottom: designSystem.spacing.xs,
          }}>
            {getStatusIcon(invoice.status)}
            <Text style={{
              fontSize: designSystem.typography.fontSize.xs,
              fontWeight: designSystem.typography.fontWeight.medium,
              color: getStatusColor(invoice.status),
              marginLeft: designSystem.spacing.xs,
              textTransform: 'uppercase',
            }}>
              {invoice.status}
            </Text>
          </View>
          <Text style={{
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary,
          }}>
            {formatCurrency(invoice.amount)}
          </Text>
          {invoice.paid > 0 && (
            <Text style={{
              fontSize: designSystem.typography.fontSize.xs,
              color: designSystem.colors.success[500],
            }}>
              Paid: {formatCurrency(invoice.paid)}
            </Text>
          )}
          <ChevronRight size={16} color={designSystem.colors.gray[400]} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          padding: designSystem.spacing.md,
          paddingBottom: designSystem.spacing.sm,
        }}>
                    <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designSystem.spacing.md,
          }}>
            <Text style={{
              fontSize: designSystem.typography.fontSize['3xl'],
              fontWeight: designSystem.typography.fontWeight.bold,
              color: designSystem.colors.text.primary,
            }}>
              Billing
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: designSystem.spacing.sm }}>
              <Pressable
                onPress={() => router.push('/settings')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: designSystem.borderRadius.lg,
                  padding: designSystem.spacing.sm,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Settings size={20} color={designSystem.colors.text.secondary} />
              </Pressable>
              <Pressable
                onPress={() => router.push(activeTab === 'quotes' ? '/billing/quotes/new' : '/billing/invoices/new')}
                style={{
                  backgroundColor: designSystem.colors.primary[500],
                  borderRadius: designSystem.borderRadius.lg,
                  paddingHorizontal: designSystem.spacing.md,
                  paddingVertical: designSystem.spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: designSystem.colors.primary[500],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: '#ffffff',
                  marginLeft: designSystem.spacing.xs,
                }}>
                  New {activeTab === 'quotes' ? 'Quote' : 'Invoice'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: designSystem.borderRadius.xl,
            padding: designSystem.spacing.xs,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.6)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setActiveTab('quotes')}
                style={{
                  flex: 1,
                  backgroundColor: activeTab === 'quotes' 
                    ? designSystem.colors.primary[500] 
                    : 'transparent',
                  borderRadius: designSystem.borderRadius.lg,
                  paddingVertical: designSystem.spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: activeTab === 'quotes' 
                    ? '#ffffff' 
                    : designSystem.colors.text.secondary,
                }}>
                  Quotes ({quotes.length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('invoices')}
                style={{
                  flex: 1,
                  backgroundColor: activeTab === 'invoices' 
                    ? designSystem.colors.primary[500] 
                    : 'transparent',
                  borderRadius: designSystem.borderRadius.lg,
                  paddingVertical: designSystem.spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: activeTab === 'invoices' 
                    ? '#ffffff' 
                    : designSystem.colors.text.secondary,
                }}>
                  Invoices ({invoices.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            padding: designSystem.spacing.md,
            paddingTop: 0,
          }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'quotes' ? (
            quotes.length > 0 ? (
              quotes.map(renderQuoteCard)
            ) : (
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <FileText size={48} color={designSystem.colors.gray[400]} />
                <Text style={{
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.text.primary,
                  marginTop: designSystem.spacing.md,
                  marginBottom: designSystem.spacing.xs,
                }}>
                  No quotes yet
                </Text>
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.text.secondary,
                  textAlign: 'center',
                }}>
                  Create your first quote to get started
                </Text>
              </View>
            )
          ) : (
            invoices.length > 0 ? (
              invoices.map(renderInvoiceCard)
            ) : (
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                                 <Receipt size={48} color={designSystem.colors.gray[400]} />
                <Text style={{
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.text.primary,
                  marginTop: designSystem.spacing.md,
                  marginBottom: designSystem.spacing.xs,
                }}>
                  No invoices yet
                </Text>
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.text.secondary,
                  textAlign: 'center',
                }}>
                  Create your first invoice to get started
                </Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
