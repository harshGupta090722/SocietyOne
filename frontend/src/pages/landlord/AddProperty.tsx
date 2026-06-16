import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { getUploadUrl } from '../../utils/fileUrl';
import { 
  Building, 
  IndianRupee, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FileText,
  Home,
  X,
  History,
  Eye,
  Clock,
  XCircle
} from 'lucide-react';

interface OwnershipRequest {
  _id: string;
  flatId?: {
    _id: string;
    flatNo: string;
    status: string;
    isApproved: string;
    monthlyRent?: string;
    securityDeposit?: string;
  } | null;
  idProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

function AddProperty() {
  const [flatNo, setFlatNo] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [requests, setRequests] = useState<OwnershipRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await api.get('/landlord/ownership-requests');
      if (res.data && res.data.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching ownership requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDocument = (path: string) => {
    const url = getUploadUrl(path);
    if (!url) return;
    if (url.toLowerCase().endsWith('.pdf')) {
      // PDFs open cleanly in a new browser tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setLightboxUrl(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile) {
      setError('Please upload an ownership document proof.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('flatNo', flatNo.toUpperCase().trim());
    formData.append('monthlyRent', monthlyRent);
    formData.append('securityDeposit', securityDeposit);
    formData.append('document', documentFile);

    try {
      const response = await api.post('/landlord/addproperty', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setSuccess('Property ownership claim submitted successfully! Awaiting administrator approval.');
        setFlatNo('');
        setMonthlyRent('');
        setSecurityDeposit('');
        setDocumentFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchRequests();
      }
    } catch (err: any) {
      console.error('Error submitting property claim:', err);
      setError(err.response?.data?.message || 'Failed to submit property claim. Please verify flat number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Register New Property</h2>
        <p className="text-sm text-slate-500 mt-1">Claim flat ownership by submitting registration details and ownership proof for Admin review.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flat number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Flat Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. A002, B104"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                Enter a pre-seeded flat identifier. Block A (A001-A120) or Block B (B001-B380).
              </p>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Monthly Rent (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 15000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Security Deposit (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 30000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ownership Document Uploader */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Ownership Proof Document
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 transition-all bg-slate-50/50">
              <input
                type="file"
                id="document-upload"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="document-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  {documentFile ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {documentFile ? documentFile.name : 'Upload ownership registration screenshot/PDF'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, or PDF up to 5MB</p>
                </div>
              </label>
              {documentFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Claim...</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4" />
                  <span>Submit Ownership Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Previous Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800">Previous Requests</h3>
        </div>
        <p className="text-sm text-slate-500 -mt-2">Track the status of all ownership claims you have submitted.</p>

        {requestsLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading your requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No previous requests</p>
            <p className="text-xs text-slate-400 mt-1">Your submitted ownership claims will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusStyles =
                req.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : req.status === 'rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800';

              return (
                <div
                  key={req._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Flat {req.flatId?.flatNo || 'N/A'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>Rent: ₹{Number(req.flatId?.monthlyRent || 0).toLocaleString()}</span>
                        <span className="text-slate-300">•</span>
                        <span>Deposit: ₹{Number(req.flatId?.securityDeposit || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submitted {new Date(req.updatedAt || req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-xs text-rose-600 mt-1.5 max-w-md">
                          <span className="font-semibold">Reason:</span> {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles}`}
                    >
                      {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      {req.status}
                    </span>
                    {req.idProofUrl && (
                      <button
                        type="button"
                        onClick={() => openDocument(req.idProofUrl)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Document
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Lightbox */}
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

export default AddProperty;