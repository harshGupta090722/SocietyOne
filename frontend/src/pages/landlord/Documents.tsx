import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  FolderOpen, 
  FileText, 
  Building,
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface FlatDoc {
  flatNo: string;
  isApproved: string;
  monthlyRent?: string;
}

interface LeaseDoc {
  _id: string;
  flatId: {
    flatNo: string;
  };
  tenantId: {
    firstName: string;
    lastName: string;
  };
  startDate: string;
  endDate: string;
}

function LandlordDocuments() {
  const [flats, setFlats] = useState<FlatDoc[]>([]);
  const [leases, setLeases] = useState<LeaseDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const flatsRes = await api.get('/landlord/properties');
      if (flatsRes.data && flatsRes.data.flats) {
        setFlats(flatsRes.data.flats);
      }

      const leasesRes = await api.get('/landlord/leases');
      if (leasesRes.data && leasesRes.data.leases) {
        setLeases(leasesRes.data.leases);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents from vault.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Opening secure documents vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Documents Vault</h2>
        <p className="text-sm text-slate-500 mt-1">Access property ownership claims, digital lease agreements, and compliance records.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ownership Proofs Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Ownership Verification Claims</span>
          </h3>

          {flats.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No flat ownership documents found.</p>
          ) : (
            <div className="space-y-3">
              {flats.map((flat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Flat {flat.flatNo} Ownership Doc</h4>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">Status: {flat.isApproved}</p>
                    </div>
                  </div>
                  <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {flat.isApproved === 'approved' ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leases Vault Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            <span>Digital Lease Agreements</span>
          </h3>

          {leases.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No active digital lease agreements.</p>
          ) : (
            <div className="space-y-3">
              {leases.map((lease) => (
                <div key={lease._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Flat {lease.flatId?.flatNo} Rent Lease</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tenant: {lease.tenantId?.firstName} {lease.tenantId?.lastName}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-xs text-emerald-600 font-bold gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandlordDocuments;
