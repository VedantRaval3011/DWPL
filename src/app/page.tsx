'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  Users,
  Warehouse,
  Send,
  Receipt
} from 'lucide-react';

interface DashboardStats {
  totalParties: number;
  totalItems: number;
  // rmStock: number; // Hidden - stock tracking continues in backend
  // fgStock: number; // Hidden - stock tracking continues in backend
  pendingChallans: number;
  pendingInvoices: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // In a real implementation, create a dedicated dashboard API endpoint
      // For now, we'll use placeholder data
      setStats({
        totalParties: 0,
        totalItems: 0,
        // rmStock: 0,
        // fgStock: 0,
        pendingChallans: 0,
        pendingInvoices: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Parties',
      value: stats?.totalParties || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/masters/party',
    },
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'bg-purple-500',
      link: '/masters/item',
    },
    // Stock cards hidden - stock tracking continues in backend
    // {
    //   title: 'RM Stock',
    //   value: stats?.rmStock || 0,
    //   icon: TrendingDown,
    //   color: 'bg-orange-500',
    //   link: '/stock?category=RM',
    // },
    // {
    //   title: 'FG Stock',
    //   value: stats?.fgStock || 0,
    //   icon: TrendingUp,
    //   color: 'bg-green-500',
    //   link: '/stock?category=FG',
    // },
  ];

  const quickActions = [
    {
      title: 'Create GRN',
      description: 'Record new goods receipt',
      icon: FileText,
      link: '/grn',
      color: 'bg-blue-600',
    },
    {
      title: 'Outward Challan',
      description: 'Create new outward challan',
      icon: Send,
      link: '/outward-challan',
      color: 'bg-indigo-600',
    },
    {
      title: 'Tax Invoice',
      description: 'Generate tax invoice',
      icon: Receipt,
      link: '/tax-invoice',
      color: 'bg-purple-600',
    },
    // View Stock action hidden - stock page still accessible via direct URL
    // {
    //   title: 'View Stock',
    //   description: 'Check current inventory',
    //   icon: Warehouse,
    //   link: '/stock',
    //   color: 'bg-green-600',
    // },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome to DWPL Manufacturing Management System"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg shadow-sm`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.link}>
              <Card hover className="cursor-pointer h-full">
                <div className="flex flex-col items-center text-center py-6 px-4">
                  <div className={`${action.color} p-5 rounded-full mb-4 shadow-md`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    {action.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {action.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <Card>
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
          System Status
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>System Status</span>
            <span className="badge badge-success">Operational</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Database</span>
            <span className="badge badge-success">Connected</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Version</span>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>1.0.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
