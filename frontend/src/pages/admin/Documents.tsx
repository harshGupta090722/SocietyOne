import React, { useEffect, useState } from 'react';
import { FileText, ShieldCheck, Home, RefreshCw, Eye, X, User, Building, Loader2, KeyRound, ScrollText } from 'lucide-react';
import api from '../../api';
import { getUploadUrl } from '../../utils/fileUrl';

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
}

interface FlatInfo {
  _id: string;
  flatNo: string;
  status: string;
}

interface IdentityDoc {
  _id: string;
  userId: UserInfo;
  idProofUrl: string;
  status: string;
  updatedAt: string;
}

interface OwnershipDoc {
  _id: string;
  userId: UserInfo;
  flatId: FlatInfo;
  idProofUrl: string;
  status: string;
  updatedAt: string;
}

interface LeaseDoc {
  _id: string;
  flatId: FlatInfo;
  tenantId: UserInfo;
  landlordId: UserInfo;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

type TabKey = 'identity' | 'ownership' | 'leases';

function Documents() {
  const [identityDocs, setIdentityDocs] = useState<IdentityDoc[]>([]);
  const [ownershipDocs, setOwnershipDocs] = useState<OwnershipDoc[]>([]);
  const [leaseDocs, setLeaseDocs] = useState<LeaseDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  // Lightbox Modal for PDFs/Images
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/documents');

      if (response.data.success) {
        setIdentityDocs(response.data.identityDocs || []);
        setOwnershipDocs(response.data.ownershipDocs || []);
        setLeaseDocs(response.data.activeLeaseDocs || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch society document vault.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleView = (path: string) => {
    const url = getUploadUrl(path);
    if (!url) return;
    if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.docx')) {
      window.open(url, '_blank');
    } else {
      setLightboxUrl(url);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'identity', label: 'Identity Verifications', icon: <ShieldCheck className="w-4 h-4" />, count: identityDocs.length },
    { key: 'ownership', label: 'Ownership Documents', icon: <KeyRound className="w-4 h-4" />, count: ownershipDocs.length },
    { key: 'leases', label: 'Active Leases', icon: <ScrollText className="w-4 h-4" />, count: leaseDocs.length },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Document Vault</h2>
          <p className="text-sm text-slate-500 mt-1">
            All verified identity documents, approved ownership proofs, and active lease agreements.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-slate-500 text-sm font-medium">Loading documents...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-red-500">
          {error}
        </div>
      ) : (
        <>
          {/* Identity Verifications Tab */}
          {activeTab === 'identity' && (
            identityDocs.length === 0 ? (
              <EmptyState message="No approved identity verifications found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {identityDocs.map((doc) => (
                  <div key={doc._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {doc.userId?.firstName} {doc.userId?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">{doc.userId?.role || 'User'}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                      <p><span className="font-semibold text-slate-600">Email:</span> {doc.userId?.email}</p>
                      <p><span className="font-semibold text-slate-600">Phone:</span> {doc.userId?.phone}</p>
                      <p><span className="font-semibold text-slate-600">Verified on:</span> {new Date(doc.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>

                    {doc.idProofUrl && (
                      <button
                        onClick={() => handleView(doc.idProofUrl)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View ID Proof
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Ownership Documents Tab */}
          {activeTab === 'ownership' && (
            ownershipDocs.length === 0 ? (
              <EmptyState message="No approved ownership documents found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownershipDocs.map((doc) => (
                  <div key={doc._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Home className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Flat {doc.flatId?.flatNo || 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-400">Ownership Proof</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Approved
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                      <p><span className="font-semibold text-slate-600">Owner:</span> {doc.userId?.firstName} {doc.userId?.lastName}</p>
                      <p><span className="font-semibold text-slate-600">Email:</span> {doc.userId?.email}</p>
                      <p><span className="font-semibold text-slate-600">Approved on:</span> {new Date(doc.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>

                    {doc.idProofUrl && (
                      <button
                        onClick={() => handleView(doc.idProofUrl)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Ownership Document
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Active Leases Tab */}
          {activeTab === 'leases' && (
            leaseDocs.length === 0 ? (
              <EmptyState message="No active lease agreements found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leaseDocs.map((lease) => (
                  <div key={lease._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 bg-slate-100 py-1 px-2.5 rounded">
                        <Building className="w-4 h-4 text-slate-500" />
                        Flat {lease.flatId?.flatNo || 'N/A'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase">Tenant</span>
                        <span className="text-slate-700 font-bold mt-1 block">
                          {lease.tenantId ? `${lease.tenantId.firstName} ${lease.tenantId.lastName}` : 'N/A'}
                        </span>
                        <span className="text-slate-400 block mt-0.5">{lease.tenantId?.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase">Landlord</span>
                        <span className="text-slate-700 font-bold mt-1 block">
                          {lease.landlordId ? `${lease.landlordId.firstName} ${lease.landlordId.lastName}` : 'N/A'}
                        </span>
                        <span className="text-slate-400 block mt-0.5">{lease.landlordId?.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                        <span className="text-slate-400 font-semibold block">Monthly Rent</span>
                        <span className="text-slate-800 font-bold text-sm">₹{Number(lease.monthlyRent || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                        <span className="text-slate-400 font-semibold block">Security Deposit</span>
                        <span className="text-slate-800 font-bold text-sm">₹{Number(lease.securityDeposit || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>Start: {new Date(lease.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>End: {new Date(lease.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

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
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FileText className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Documents will appear here once they are approved.</p>
    </div>
  );
}

export default Documents;