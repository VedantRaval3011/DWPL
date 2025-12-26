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
  rmStock: number;
  fgStock: number;
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
        rmStock: 0,
        fgStock: 0,
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
    {
      title: 'RM Stock',
      value: stats?.rmStock || 0,
      icon: TrendingDown,
      color: 'bg-orange-500',
      link: '/stock?category=RM',
    },
    {
      title: 'FG Stock',
      value: stats?.fgStock || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/stock?category=FG',
    },
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
    {
      title: 'View Stock',
      description: 'Check current inventory',
      icon: Warehouse,
      link: '/stock',
      color: 'bg-green-600',
    },
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
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.link}>
              <Card hover className="cursor-pointer h-full">
                <div className="flex flex-col items-center text-center p-4">
                  <div className={`${action.color} p-4 rounded-full mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          System Overview
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">System Status</span>
            <span className="badge badge-success">Operational</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Database</span>
            <span className="badge badge-success">Connected</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400">Version</span>
            <span className="text-slate-900 dark:text-white font-medium">1.0.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
