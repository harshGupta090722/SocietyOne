import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../../api';

interface TenantDashboardData {
  tenantName: string;
  flatAssigned: boolean;
  flatNo?: string;
  flatStatus?: string;
  outstandingDue: number;
  type?: string;
  lease?: any;
  payments?: any[];
}

function TenantDashboard() {
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data && meRes.data.user) {
          if (!meRes.data.user.isVerified) {
            navigate('/tenant/profile');
            return;
          }
        }

        const response = await api.get('/tenant/dashboard');
        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Error fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (isLoading) return <div className="text-slate-500 font-sans p-6">Loading your dashboard...</div>;
  if (error) return <div className="text-red-500 font-sans p-6">{error}</div>;

  if (!data?.flatAssigned) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">No Active Property</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          You have not been assigned to any flat yet. Please contact your landlord to link your account to a property.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Current Flat',
      value: data.flatNo ? `Unit ${data.flatNo}` : 'Not Assigned',
      icon: Home,
      color: 'bg-blue-100 text-blue-600',
      subtitle: `Status: ${data.flatStatus || 'N/A'}`
    },
    {
      title: 'Monthly Rent',
      value: data.lease?.monthlyRent ? `₹${data.lease.monthlyRent.toLocaleString()}` : '₹0',
      icon: CreditCard,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Pending Dues',
      value: `₹${data.outstandingDue?.toLocaleString() || 0}`,
      icon: AlertTriangle,
      color: data.outstandingDue > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Lease Status',
      value: data.lease?.status ? data.lease.status.toUpperCase() : 'INACTIVE',
      icon: ArrowRight,
      color: data.lease?.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome, {data.tenantName}</h2>
        <p className="text-sm text-slate-500 mt-1">Here is the summary of your tenancy.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-slate-800">Recent Payments</h3>
             <button className="text-sm text-[#3b82f6] font-medium hover:underline flex items-center">
               View All <ArrowRight className="h-4 w-4 ml-1" />
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payments && data.payments.length > 0 ? (
                  data.payments.slice(0, 5).map((payment: any, index: number) => (
                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${payment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-slate-500">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl shadow-sm p-6 text-white flex flex-col justify-between">
          <div>
             <h3 className="text-lg font-bold mb-2">Need to pay rent?</h3>
             <p className="text-sm text-slate-300">Upload your payment screenshot to clear your outstanding dues.</p>
          </div>
          <button className="mt-6 w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors">
            Pay Rent Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;