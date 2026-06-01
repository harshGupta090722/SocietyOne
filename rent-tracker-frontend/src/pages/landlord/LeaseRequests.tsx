import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  CheckSquare, 
  Check, 
  X, 
  User, 
  AlertTriangle,
  Loader2,
  DollarSign,
  Building,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface TenantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface FlatInfo {
  flatNo: string;
  monthlyRent: string;
  securityDeposit: string;
}

interface LeaseInfo {
  _id: string;
  flatId: FlatInfo;
}

interface PaymentRecord {
  _id: string;
  paymentId: string;
  leaseId: LeaseInfo;
  tenantId: TenantInfo;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  documentUrl?: string;
  rentMonth?: string;
}

function LeaseRequests() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);
  
  // Lightbox/Modal image preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchLeaseRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/landlord/payments');
      if (response.data && response.data.payments) {
        // Show pending requests
        setPayments(response.data.payments);
      }
    } catch (err: any) {
      console.error('Error fetching lease requests:', err);
      setError('Failed to fetch rental lease requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLeaseRequests, 10000); // 10s auto-refresh
    fetchLeaseRequests();
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      setActioningId(paymentId);
      setError('');
      
      const response = await api.post(`/landlord/payments/${paymentId}/status`, { status });
      if (response.data) {
        // Refresh requests queue
        await fetchLeaseRequests();
      }
    } catch (err: any) {
      console.error('Error updating request status:', err);
      setError(err.response?.data?.message || 'Failed to process lease request.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading lease requests...</p>
      </div>
    );
  }

  const activeRequests = payments.filter(p => p.status === 'pending');
  const pastRequests = payments.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lease Requests Queue</h2>
        <p className="text-sm text-slate-500 mt-1">Verify tenant rental requests and deposit screenshots to authorize flat leasing contracts.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Active Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>Active Requests</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {activeRequests.length}
          </span>
        </h3>

        {activeRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-500">Your lease approval queue is completely clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeRequests.map((request) => {
              const fileUrl = request.documentUrl 
                ? request.documentUrl.startsWith('http') 
                  ? request.documentUrl 
                  : `${api.defaults.baseURL || ''}${request.documentUrl}`
                : '';

              return (
                <div 
                  key={request.paymentId} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left Column: Tenant & Property Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">
                          {request.tenantId?.firstName} {request.tenantId?.lastName}
                        </h4>
                        <p className="text-xs text-slate-400">Tenant Prospect</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <Building className="w-3.5 h-3.5" /> Unit & Property
                        </span>
                        <p className="font-bold text-slate-800 mt-1">Flat {request.leaseId?.flatId?.flatNo}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" /> Security Deposit Paid
                        </span>
                        <p className="font-bold text-emerald-600 mt-1">₹{request.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold">Contact Email</span>
                        <p className="text-sm font-medium text-slate-700 mt-0.5 break-all">{request.tenantId?.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold">Contact Phone</span>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{request.tenantId?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Screenshot & Actions */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center justify-center h-32 relative group overflow-hidden">
                      {fileUrl ? (
                        <>
                          <img 
                            src={fileUrl} 
                            alt="Payment receipt" 
                            className="object-cover h-full w-full rounded-lg cursor-zoom-in"
                            onClick={() => setPreviewImage(fileUrl)}
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-zoom-in rounded-lg" onClick={() => setPreviewImage(fileUrl)}>
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                          <p className="text-[10px] font-semibold">No receipt image attached</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleAction(request.paymentId, 'approved')}
                        disabled={actioningId !== null}
                        className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer gap-1.5"
                      >
                        {actioningId === request.paymentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleAction(request.paymentId, 'rejected')}
                        disabled={actioningId !== null}
                        className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer gap-1.5"
                      >
                        {actioningId === request.paymentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-4 h-4" />}
                        Reject Request
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processed/Past Requests */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-800">Processed Requests</h3>
        {pastRequests.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium">No processed requests history.</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Tenant Name</th>
                  <th className="p-4">Unit No</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pastRequests.map((request) => (
                  <tr key={request.paymentId} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700">{request.paymentId}</td>
                    <td className="p-4 text-slate-600">
                      {request.tenantId?.firstName} {request.tenantId?.lastName}
                    </td>
                    <td className="p-4 font-bold text-slate-800">Flat {request.leaseId?.flatId?.flatNo}</td>
                    <td className="p-4 font-bold text-slate-800">₹{request.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          request.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(request.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden border border-slate-100 p-2">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950 text-white rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Expanded receipt preview" 
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaseRequests;
