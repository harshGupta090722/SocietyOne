import React, { useEffect, useState } from 'react';
import { Home, Filter, Plus, Search } from 'lucide-react';
import api from '../../api';

interface Flat {
  _id: string;
  flatNo: string;
  status: 'occupied' | 'vacant';
  monthlyRent?: number;
  tenantName?: string;
}

function Flats() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        // Fetching flats logic using viewLeases since we don't have a direct flats endpoint
        const response = await api.get('/landlord/leases');
        if (response.data.leases) {
          // Use mock data to accurately represent the design
          setFlats([
            { _id: 'f1', flatNo: '101A', status: 'occupied', monthlyRent: 15000, tenantName: 'Alice Smith' },
            { _id: 'f2', flatNo: '102B', status: 'occupied', monthlyRent: 16000, tenantName: 'Bob Johnson' },
            { _id: 'f3', flatNo: '201A', status: 'vacant' },
            { _id: 'f4', flatNo: '202B', status: 'vacant' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load flats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Occupied Flats & Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your property units and occupancy status.</p>
        </div>
        <button className="flex items-center bg-[#1e293b] hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex space-x-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
            placeholder="Search by unit number or status..."
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
          <Filter className="h-4 w-4 mr-2 text-slate-500" />
          Filters
        </button>
      </div>

      {/* Grid of Flats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-slate-500 py-8">Loading properties...</div>
        ) : flats.length > 0 ? (
          flats.map((flat) => (
            <div key={flat._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-slate-100 relative">
                {/* Placeholder for property image */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                   <Home className="h-12 w-12" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                    ${flat.status === 'occupied' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}
                  `}>
                    {flat.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800">Unit {flat.flatNo}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Rent</span>
                    <span className="font-medium text-slate-900">{flat.monthlyRent ? `₹${flat.monthlyRent.toLocaleString()}` : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tenant</span>
                    <span className="font-medium text-slate-900">{flat.tenantName || 'None'}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full bg-[#f8fafc] hover:bg-slate-100 text-slate-700 font-medium py-2 rounded-md border border-slate-200 text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 py-8">No properties found.</div>
        )}
      </div>
    </div>
  );
}

export default Flats;
