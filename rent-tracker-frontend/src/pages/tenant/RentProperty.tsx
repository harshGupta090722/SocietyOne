import React, { useEffect, useState } from 'react';
import {
  Building,
  User,
  CreditCard,
  ShieldCheck,
  Upload,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react';
import api from '../../api';

interface Flat {
  _id: string;
  flatNo: string;
  monthlyRent: string;
  securityDeposit: string;
  status: string;
  isApproved: string;
  ownerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

function RentProperty() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / Request State
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [hasActiveLease, setHasActiveLease] = useState(false);
  const [hasPendingLease, setHasPendingLease] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [flatsRes, dashRes] = await Promise.all([
          api.get('/tenant/vacant-flats'),
          api.get('/tenant/dashboard').catch(() => null)
        ]);

        if (flatsRes.data && flatsRes.data.flats) {
          setFlats(flatsRes.data.flats);
        }
        if (dashRes?.data?.flatAssigned) {
          setHasActiveLease(true);
        }
        if (dashRes?.data?.hasPendingLease) {
          setHasPendingLease(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch vacant properties.');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchVacantFlats = async () => {
    try {
      const response = await api.get('/tenant/vacant-flats');
      if (response.data && response.data.flats) {
        setFlats(response.data.flats);
      }
    } catch (err: any) {
      console.error('Failed to refresh vacant flats', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSubmitError('');
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlat) return;
    if (!selectedFile) {
      setSubmitError('Please upload a screenshot of your payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const formData = new FormData();
      formData.append('flatId', selectedFlat._id);
      formData.append('document', selectedFile);

      await api.post('/tenant/request-rent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMsg(`Your lease request for Flat ${selectedFlat.flatNo} has been submitted successfully! Status is pending landlord payment verification.`);
      setSelectedFlat(null);
      setSelectedFile(null);

      // Refresh vacant flats
      await fetchVacantFlats();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit rental request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Available Properties</h2>
        <p className="text-sm text-slate-500 mt-1">Browse vacant flats, make payments, and claim your next home.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Submission Successful!</span>
            <span className="text-sm leading-relaxed">{successMsg}</span>
          </div>
        </div>
      )}

      {hasActiveLease && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Active Lease Restriction</span>
            <span className="text-sm leading-relaxed">You can't rent more than one flat as of now. Please make another id to rent another flat.</span>
          </div>
        </div>
      )}

      {hasPendingLease && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Pending Lease Request</span>
            <span className="text-sm leading-relaxed">You already have an active Lease Request.Please wait for it's Execution.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Fetching available flats...</p>
        </div>
      ) : flats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flats.map((flat) => (
            <div
              key={flat._id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg">Flat {flat.flatNo}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 uppercase">
                    {flat.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      Owner:{' '}
                      <span className="font-semibold text-slate-800">
                        {flat.ownerId?.firstName} {flat.ownerId?.lastName}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>
                      Rent:{' '}
                      <span className="font-bold text-slate-800">
                        ₹{parseFloat(flat.monthlyRent || '0').toLocaleString()}/mo
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>
                      Security Deposit:{' '}
                      <span className="font-bold text-slate-800">
                        ₹{parseFloat(flat.securityDeposit || '0').toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    if (hasActiveLease || hasPendingLease) return;
                    setSelectedFlat(flat);
                    setSuccessMsg('');
                    setSubmitError('');
                    setSelectedFile(null);
                  }}
                  disabled={hasActiveLease || hasPendingLease}
                  className="w-full py-2.5 px-4 bg-[#1e293b] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Request Property
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Vacant Flats</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            There are currently no vacant or approved flats available to rent in the society database. Please check back later.
          </p>
        </div>
      )}

      {/* Property Request Modal */}
      {selectedFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-8 animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Request Flat {selectedFlat.flatNo}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rent: ₹{parseFloat(selectedFlat.monthlyRent || '0').toLocaleString()} &bull; Deposit: ₹{parseFloat(selectedFlat.securityDeposit || '0').toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedFlat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-semibold">{submitError}</span>
                </div>
              )}

              {/* QR Code and UPI detail section */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center space-y-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Landlord Payment QR Code
                </p>

                {/* Simulated QR Code Canvas / Layout */}
                <div className="relative mx-auto w-40 h-40 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center shadow-sm p-3 group hover:scale-[1.02] transition-transform duration-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=landlord-${selectedFlat.ownerId?._id || 'unknown'}@upi%26pn=${encodeURIComponent(selectedFlat.ownerId?.firstName || '')}%20${encodeURIComponent(selectedFlat.ownerId?.lastName || '')}%26am=${parseFloat(selectedFlat.securityDeposit || '0') + parseFloat(selectedFlat.monthlyRent || '0')}`}
                    alt="Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-900/5 rounded-2xl pointer-events-none" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFlat.ownerId?.firstName} {selectedFlat.ownerId?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    UPI ID: <span className="font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-700">landlord-{selectedFlat.ownerId?._id?.substring(18) || 'pay'}@upi</span>
                  </p>
                  <p className="text-xs font-semibold text-blue-600 pt-1">
                    Please pay total ₹{(parseFloat(selectedFlat.securityDeposit || '0') + parseFloat(selectedFlat.monthlyRent || '0')).toLocaleString()} (Deposit + Rent)
                  </p>
                </div>
              </div>

              {/* Upload Screenshot */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload Payment Screenshot
                </label>

                <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 transition-all duration-200 bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="mx-auto w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-slate-600 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {selectedFile ? selectedFile.name : 'Choose screenshot image'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPEG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      <div className="text-left">
                        <span className="text-sm font-bold text-slate-800 block truncate max-w-[240px]">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFlat(null)}
                  className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentProperty;
