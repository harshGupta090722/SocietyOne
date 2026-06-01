import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Home, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  CheckSquare,
  Loader2
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  pendingPayments: number;
  monthlyIncome: number;
  activeTenants: number;
  pendingLeaseRequests: number;
}

function LandlordDashboard() {
  const { firstName } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/landlord/dashboard');
        if (response.data && response.data.success !== false) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching landlord dashboard:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties?.toString() || '0',
      icon: Building,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Occupied Properties',
      value: stats?.occupiedProperties?.toString() || '0',
      icon: Home,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      subtitle: `${stats?.totalProperties ? ((stats.occupiedProperties / stats.totalProperties) * 100).toFixed(0) : 0}% Occupancy Rate`
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments?.toString() || '0',
      icon: AlertTriangle,
      color: stats?.pendingPayments && stats.pendingPayments > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100',
    },
    {
      title: 'Monthly Income',
      value: `₹${stats?.monthlyIncome?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      title: 'Active Tenants',
      value: stats?.activeTenants?.toString() || '0',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Pending Lease Requests',
      value: stats?.pendingLeaseRequests?.toString() || '0',
      icon: CheckSquare,
      color: stats?.pendingLeaseRequests && stats.pendingLeaseRequests > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Landlord Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {firstName || 'Landlord'}. Here is your portfolio summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-64 flex flex-col justify-center items-center text-slate-400">
          <DollarSign className="w-10 h-10 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">Finances Overview Chart (Coming Soon)</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-64 flex flex-col justify-center items-center text-slate-400">
          <Building className="w-10 h-10 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">Property Occupancy Distribution (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}

export default LandlordDashboard;