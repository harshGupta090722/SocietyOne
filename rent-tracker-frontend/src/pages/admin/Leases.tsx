import React, { useEffect, useState } from 'react';
import { FileText, Key, Home, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api';

interface Lease {
  _id: string;
  flatId?: {
    _id: string;
    flatNo: string;
  };
  tenantId?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  landlordId?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  status: 'pending' | 'approved' | 'rejected' | 'ended';
  rejectionReason?: string;
  createdAt: string;
}

function Leases() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/leases');
      if (response.data.success) {
        setLeases(response.data.allLeases || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch society lease agreements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Society Leases & Agreements</h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview ledger of all dynamic rent allocations and lease states.
          </p>
        </div>

        <button
          onClick={fetchLeases}
          className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="animate-pulse text-slate-500 text-lg font-medium">Fetching lease register...</div>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-red-500">
          {error}
        </div>
      ) : leases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
          No society leases are currently configured.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">Flat No</th>
                  <th className="py-4 px-6">Tenant</th>
                  <th className="py-4 px-6">Landlord</th>
                  <th className="py-4 px-6">Lease Term</th>
                  <th className="py-4 px-6">Monthly Rent</th>
                  <th className="py-4 px-6">Deposit</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leases.map((lease) => (
                  <tr key={lease._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-slate-400" />
                        {lease.flatId?.flatNo || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {lease.tenantId ? (
                        <div>
                          <div className="font-semibold text-slate-700">
                            {lease.tenantId.firstName} {lease.tenantId.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{lease.tenantId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Tenant linked</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {lease.landlordId ? (
                        <div>
                          <div className="font-semibold text-slate-700">
                            {lease.landlordId.firstName} {lease.landlordId.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{lease.landlordId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Landlord linked</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-slate-700 font-medium space-x-1">
                        <Calendar className="w-4 h-4 text-slate-400 mr-1.5" />
                        <span>{formatDate(lease.startDate)}</span>
                        <span className="text-slate-400 font-normal">to</span>
                        <span>{formatDate(lease.endDate)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      ₹{(lease.rentAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      ₹{(lease.securityDeposit || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          lease.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : lease.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : lease.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {lease.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leases;
