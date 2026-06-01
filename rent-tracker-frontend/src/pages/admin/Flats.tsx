import React, { useEffect, useState } from 'react';
import { Search, Home, DollarSign, Filter, RefreshCw } from 'lucide-react';
import api from '../../api';

interface Flat {
  _id: string;
  flatNo: string;
  status: 'occupied' | 'vacant' | 'unassigned';
  monthlyRent: number;
  securityDeposit: number;
  ownerId?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
  leaseId?: {
    tenantId?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      isVerified: boolean;
    };
  };
}

function Flats() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'unassigned'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFlats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/flats');
      if (response.data.success) {
        setFlats(response.data.flats);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load society flat inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const filteredFlats = flats.filter((flat) => {
    const matchesSearch =
      flat.flatNo.toLowerCase().includes(search.toLowerCase()) ||
      (flat.ownerId &&
        `${flat.ownerId.firstName} ${flat.ownerId.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())) ||
      (flat.leaseId?.tenantId &&
        `${flat.leaseId.tenantId.firstName} ${flat.leaseId.tenantId.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()));

    const matchesFilter = statusFilter === 'all' || flat.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Flats & Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Displaying all society flats, active landlords, and current occupants.
          </p>
        </div>

        <button
          onClick={fetchFlats}
          className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Flat No, Landlord name, or Tenant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-lg py-2 px-3 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="animate-pulse text-slate-500 text-lg font-medium">Fetching society flats...</div>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-red-500">
          {error}
        </div>
      ) : filteredFlats.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
          No flats match your current search queries.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">Flat No</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Landlord</th>
                  <th className="py-4 px-6">Current Tenant</th>
                  <th className="py-4 px-6">Monthly Rent</th>
                  <th className="py-4 px-6">Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredFlats.map((flat) => (
                  <tr key={flat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-slate-400" />
                        {flat.flatNo}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          flat.status === 'occupied'
                            ? 'bg-emerald-50 text-emerald-700'
                            : flat.status === 'vacant'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {flat.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {flat.ownerId ? (
                        <div>
                          <div className="font-semibold text-slate-700">
                            {flat.ownerId.firstName} {flat.ownerId.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{flat.ownerId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Landlord linked</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {flat.leaseId?.tenantId ? (
                        <div>
                          <div className="font-semibold text-slate-700">
                            {flat.leaseId.tenantId.firstName} {flat.leaseId.tenantId.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{flat.leaseId.tenantId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Active Tenant</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      ₹{(flat.monthlyRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      ₹{(flat.securityDeposit || 0).toLocaleString('en-IN')}
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

export default Flats;
