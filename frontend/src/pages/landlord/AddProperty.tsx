import React, { useState, useRef } from 'react';
import api from '../../api';
import { 
  Building, 
  DollarSign, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FileText,
  Home,
  X
} from 'lucide-react';

function AddProperty() {
  const [flatNo, setFlatNo] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
                  <DollarSign className="w-5 h-5 text-slate-400" />
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
                  <DollarSign className="w-5 h-5 text-slate-400" />
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
    </div>
  );
}

export default AddProperty;
