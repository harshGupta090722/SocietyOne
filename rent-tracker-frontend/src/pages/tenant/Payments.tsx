import React, { useEffect, useState } from 'react';
import { CreditCard, UploadCloud, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api';

interface Payment {
  _id: string;
  paymentId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  month?: string;
  paymentDate: string;
}

function TenantPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [rentMonth, setRentMonth] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/tenant/payments');
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !file) {
      setMessage({ type: 'error', text: 'Please provide amount and screenshot' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append('document', file);
      const uploadRes = await api.post('/tenant/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Submit payment with screenshot URL
      if (uploadRes.data.fileUrl) {
        await api.post('/tenant/pay-rent', {
          amount: Number(amount),
          month: rentMonth ? new Date(rentMonth) : undefined,
          screenshotURL: uploadRes.data.fileUrl
        });
        
        setMessage({ type: 'success', text: 'Payment submitted successfully! Awaiting landlord approval.' });
        setAmount('');
        setRentMonth('');
        setFile(null);
        fetchPayments(); // Refresh list
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit payment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payment History & Settlement</h2>
          <p className="text-sm text-slate-500 mt-1">Submit your rent and track payment statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Submission Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-[#f8fafc]">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-[#3b82f6]" />
                Submit Rent Payment
              </h3>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {message.text && (
                <div className={`p-3 rounded-md text-sm flex items-start ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{message.text}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rent Month (Optional)</label>
                <input
                  type="month"
                  value={rentMonth}
                  onChange={(e) => setRentMonth(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Screenshot</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-[#3b82f6] hover:bg-blue-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#3b82f6] hover:text-[#2563eb]">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          accept="image/jpeg, image/png, application/pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                    {file && <p className="text-sm font-semibold text-[#1e293b] mt-2">{file.name}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e293b] hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Payment for Approval'}
              </button>
            </form>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Payment History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#f8fafc]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading history...</td></tr>
                  ) : payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {payment.month ? new Date(payment.month).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600"/> Approved</span>}
                          {payment.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5 mr-1 text-amber-600"/> Pending</span>}
                          {payment.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"><XCircle className="w-3.5 h-3.5 mr-1 text-rose-600"/> Rejected</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No payment history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TenantPayments;
