import React, { useEffect, useState } from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import api from '../../api';

interface Payment {
  _id: string;
  paymentId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  screenshotURL: string;
  tenantId?: {
    firstName: string;
    lastName: string;
  };
}

function Approvals() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/landlord/payments');
      if (response.data.payments) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      setError('Failed to load payment approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      await api.post(`/landlord/payments/${paymentId}/status`, { status });
      // Refresh list or update state locally
      setPayments(payments.map(p => 
        p.paymentId === paymentId ? { ...p, status } : p
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pastPayments = payments.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payment Approvals</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve tenant rent submissions.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#3b82f6]" />
            Action Required
            <span className="ml-3 bg-[#3b82f6] text-white text-xs py-0.5 px-2.5 rounded-full font-bold">
              {pendingPayments.length}
            </span>
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading payments...</div>
          ) : pendingPayments.length > 0 ? (
            pendingPayments.map(payment => (
              <div key={payment._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-6">
                  {/* Thumbnail */}
                  <div 
                    className="h-20 w-20 bg-slate-200 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => setSelectedImage(payment.screenshotURL)}
                  >
                    {payment.screenshotURL ? (
                      <img src={`http://localhost:5000${payment.screenshotURL}`} alt="Receipt" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      ₹{payment.amount.toLocaleString()}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Submitted by <span className="font-medium text-slate-700">{payment.tenantId?.firstName} {payment.tenantId?.lastName}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ID: {payment.paymentId} &bull; {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button 
                    onClick={() => handleUpdateStatus(payment.paymentId, 'rejected')}
                    className="flex items-center px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(payment.paymentId, 'approved')}
                    className="flex items-center px-4 py-2 bg-[#1e293b] hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Check className="w-12 h-12 text-emerald-400 mb-3" />
              <p>You're all caught up! No pending approvals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Payments - Simplified */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recently Processed</h3>
        </div>
        <div className="p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastPayments.slice(0, 5).map(payment => (
                <tr key={payment._id}>
                  <td className="py-3 text-sm font-medium text-slate-800">
                    {payment.tenantId?.firstName} {payment.tenantId?.lastName}
                  </td>
                  <td className="py-3 text-sm text-slate-600">₹{payment.amount.toLocaleString()}</td>
                  <td className="py-3 text-sm text-slate-600">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                      ${payment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pastPayments.length === 0 && !isLoading && (
                 <tr><td colSpan={4} className="py-4 text-center text-sm text-slate-500">No processed payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal overlay */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="relative max-w-3xl w-full bg-white rounded-xl shadow-2xl p-2">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-slate-500 hover:text-slate-800 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={`http://localhost:5000${selectedImage}`} alt="Full receipt" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Approvals;
