import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, User, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api';

interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flatNo?: string;
  leaseStatus?: string;
}

function TenantDirectory() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/landlord/leases');
      if (response.data && response.data.leases) {
        const leasesList = response.data.leases;
        // Map leases to tenant structure
        const mappedTenants: Tenant[] = leasesList.map((lease: any) => ({
          _id: lease.tenantId?._id || lease._id,
          firstName: lease.tenantId?.firstName || 'Unknown',
          lastName: lease.tenantId?.lastName || 'Tenant',
          email: lease.tenantId?.email || 'No email',
          phone: lease.tenantId?.phone || 'No phone',
          flatNo: lease.flatId?.flatNo || 'N/A',
          leaseStatus: 'Active'
        }));
        setTenants(mappedTenants);
      }
    } catch (err: any) {
      console.error('Failed to load tenants:', err);
      setError('Failed to fetch active tenants directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t => 
    t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.flatNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Tenants</h2>
          <p className="text-sm text-slate-500 mt-1">Directory of all tenants currently residing in your properties.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex space-x-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400"
            placeholder="Search by tenant name, unit number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
            <tr>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Tenant Name</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Unit / Flat</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Contact Info</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <p className="text-xs font-semibold">Loading tenants directory...</p>
                  </div>
                </td>
              </tr>
            ) : filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {tenant.firstName[0]}{tenant.lastName[0]}
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold text-slate-800">{tenant.firstName} {tenant.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800">Flat {tenant.flatNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {tenant.email}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {tenant.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {tenant.leaseStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No active tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TenantDirectory;
