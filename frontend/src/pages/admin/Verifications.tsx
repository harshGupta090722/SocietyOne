import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import api from '../../api';

interface Verification {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'landlord' | 'tenant';
    phone: string;
    isVerified: boolean;
  };
  flatId?: {
    _id: string;
    flatNo: string;
    status: string;
    isApproved: string;
  };
  idProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  type?: 'identity' | 'ownership';
  rejectionReason?: string;
  createdAt: string;
}

function Verifications() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Rejection State
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox Modal for Proof
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/document-verifications');
      if (response.data.success) {
        setVerifications(response.data.verifications);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch verification requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload: any = { status };
      if (status === 'rejected') {
        payload.rejectionReason = rejectionReason;
      }

      const response = await api.patch(`/admin/document-verifications/${id}`, payload);
      if (response.data.success) {
        setSuccessMsg(`Verification request successfully ${status}!`);
        setSelectedVerificationId(null);
        setRejectionReason('');
        fetchVerifications();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert upload paths to active backend urls
  const getProofUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:4000/${path.replace(/\\/g, '/')}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Identity Verification Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review landlord and tenant onboarding credentials to verify community status.
          </p>
        </div>

        <button
          onClick={fetchVerifications}
          className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center font-semibold">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center font-semibold">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="animate-pulse text-slate-500 text-lg font-medium">Fetching verification ledger...</div>
        </div>
      ) : verifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
          No identity verifications have been uploaded yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">Requester</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Contact info</th>
                  <th className="py-4 px-6">Proof Document</th>
                  <th className="py-4 px-6">Verification status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div>
                        {v.userId ? `${v.userId.firstName} ${v.userId.lastName}` : <span className="text-slate-400 italic">Deleted User</span>}
                      </div>
                      {v.flatId && (
                        <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 mt-1 inline-block">
                          Claimed: Flat {v.flatId.flatNo}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          v.userId?.role === 'landlord'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {v.userId?.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 font-medium">{v.userId?.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{v.userId?.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      {v.idProofUrl ? (
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(getProofUrl(v.idProofUrl))}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          {v.type === 'ownership' ? 'View Ownership Doc' : 'View ID Proof'}
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">No upload</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          v.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : v.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {v.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        {v.status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                        {v.status}
                      </span>
                      {v.status === 'rejected' && v.rejectionReason && (
                        <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={v.rejectionReason}>
                          Reason: {v.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {v.status === 'pending' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleAction(v._id, 'approved')}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-md text-xs transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedVerificationId(v._id)}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-md text-xs transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedVerificationId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-lg font-bold text-slate-800">Reject Verification Request</h3>
            <p className="text-sm text-slate-500 mt-1">
              Please provide a valid reason explaining why this onboarding credential was rejected.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rejection Reason</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50"
                rows={4}
                placeholder="e.g. Identity proof is blur, or name on document does not match account records."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedVerificationId(null);
                  setRejectionReason('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedVerificationId, 'rejected')}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Reject Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center bg-white/5 p-4 rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white rounded-full p-2 border border-white/20 hover:bg-slate-800 transition-colors z-10 font-bold"
            >
              ✕
            </button>
            <img
              src={lightboxUrl}
              alt="Identity Proof"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                // If backend local host fails to render, show custom icon fallbacks
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Verifications;
