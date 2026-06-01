import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  CreditCard, 
  Search, 
  Check, 
  X, 
  ExternalLink, 
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

interface TenantInfo {
  firstName: string;
  lastName: string;
}

interface FlatInfo {
  flatNo: string;
}

interface LeaseInfo {
  flatId: FlatInfo;
}

interface PaymentRecord {
  paymentId: string;
  leaseId: LeaseInfo;
  tenantId: TenantInfo;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  documentUrl?: string;
  rentMonth?: string;
}

function LandlordPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Lightbox screenshot state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setError('');
      const response = await api.get('/landlord/payments');
      if (response.data && response.data.payments) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to retrieve payments ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      setActioningId(paymentId);
      setError('');
      
      const response = await api.post(`/landlord/payments/${paymentId}/status`, { status });
      if (response.data) {
        await fetchPayments();
      }
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      setError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    const name = `${payment.tenantId?.firstName || ''} ${payment.tenantId?.lastName || ''}`.toLowerCase();
    const flat = (payment.leaseId?.flatId?.flatNo || '').toLowerCase();
    const id = payment.paymentId.toLowerCase();
    const month = (payment.rentMonth || '').toLowerCase();
    return name.includes(term) || flat.includes(term) || id.includes(term) || month.includes(term);
  });

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading payments ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payments & Ledger</h2>
        <p className="text-sm text-slate-500 mt-1">Review rent transactions, inspect screenshot proofs, and approve incoming payments.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex space-x-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400"
            placeholder="Search by ID, tenant, flat, or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
            <tr>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Payment ID</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Tenant</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Flat</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Rent Month</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Receipt</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-sm">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => {
                const fileUrl = payment.documentUrl 
                  ? payment.documentUrl.startsWith('http') 
                    ? payment.documentUrl 
                    : `${api.defaults.baseURL || ''}${payment.documentUrl}`
                  : '';

                return (
                  <tr key={payment.paymentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">{payment.paymentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {payment.tenantId?.firstName} {payment.tenantId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                      Flat {payment.leaseId?.flatId?.flatNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">{payment.rentMonth || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">₹{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fileUrl ? (
                        <button 
                          onClick={() => setPreviewImage(fileUrl)}
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold gap-1"
                        >
                          <ImageIcon className="w-4 h-4" />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No proof</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(payment.paymentId, 'approved')}
                            disabled={actioningId !== null}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(payment.paymentId, 'rejected')}
                            disabled={actioningId !== null}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No payment ledger records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox Modal */}
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

export default LandlordPayments;
