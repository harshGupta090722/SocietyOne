import React, { useEffect, useState } from 'react';
import api from '../../api';
import { getUploadUrl } from '../../utils/fileUrl';
import { 
  FolderOpen, 
  FileText, 
  Building,
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

interface FlatDoc {
  flatNo: string;
  isApproved: string;
  monthlyRent?: string;
  _id: string;
}

interface OwnershipRequest {
  _id: string;
  flatId?: {
    _id: string;
    flatNo: string;
  } | null;
  idProofUrl: string;
  status: string;
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
  const [ownershipRequests, setOwnershipRequests] = useState<OwnershipRequest[]>([]);
  const [leases, setLeases] = useState<LeaseDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchDocsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const flatsRes = await api.get('/landlord/properties');
      if (flatsRes.data && flatsRes.data.flats) {
        setFlats(flatsRes.data.flats);
      }

      const ownershipRes = await api.get('/landlord/ownership-requests');
      if (ownershipRes.data && ownershipRes.data.requests) {
        setOwnershipRequests(ownershipRes.data.requests);
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

  const getDocUrlForFlat = (flatId: string): string | null => {
    const match = ownershipRequests.find(r => r.flatId?._id === flatId && r.idProofUrl);
    return match?.idProofUrl || null;
  };

  const handleViewDoc = (path: string) => {
    const url = getUploadUrl(path);
    if (!url) return;
    if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.docx')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setLightboxUrl(url);
    }
  };

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
              {flats.map((flat, idx) => {
                const docUrl = getDocUrlForFlat(flat._id);
                return (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Flat {flat.flatNo} Ownership Doc</h4>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">Status: {flat.isApproved}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        flat.isApproved === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {flat.isApproved === 'approved' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    {docUrl && (
                      <button
                        onClick={() => handleViewDoc(docUrl)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Document
                      </button>
                    )}
                  </div>
                );
              })}
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

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center bg-white/5 p-4 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white rounded-full p-2 border border-white/20 hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="Ownership document"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordDocuments;