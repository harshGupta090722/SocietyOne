import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Building, 
  User, 
  DollarSign, 
  Clock, 
  Key,
  ShieldCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';
import api from '../../api';

interface LeaseDetails {
  _id: string;
  flatId: {
    _id: string;
    flatNo: string;
    status: string;
  } | string;
  landlordId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'terminated' | 'expired';
}

function MyLease() {
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [flatNo, setFlatNo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaseDetails();
  }, []);

  const fetchLeaseDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/tenant/dashboard');
      if (response.data.success && response.data.flatAssigned) {
        setLease(response.data.lease);
        setFlatNo(response.data.flatNo || '');
      } else {
        setLease(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lease details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading lease details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
        <Clock className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm space-y-5">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Key className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">No Active Lease Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            You do not currently have an active lease contract. Rent an available flat from our listings to activate your tenancy.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => navigate('/tenant/rent-property')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            Browse Vacant Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Lease Agreement</h2>
        <p className="text-sm text-slate-500 mt-1">Review the legal bindings and financial structures of your tenancy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Lease Document Representation */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-8 space-y-6">
            {/* Agreement Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                  {lease.status} Lease
                </span>
                <h3 className="text-lg font-bold text-slate-800 pt-1">Tenancy Lease Contract</h3>
                <p className="text-xs text-slate-400">Ref ID: {lease._id}</p>
              </div>
              <FileText className="w-9 h-9 text-slate-300" />
            </div>

            {/* Flat details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Flat / Unit No</span>
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>Flat {flatNo || 'N/A'}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Property Landlord</span>
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>
                    {lease.landlordId ? `${lease.landlordId.firstName} ${lease.landlordId.lastName}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Rent Rate</span>
                <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-lg">
                  <DollarSign className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>₹{lease.monthlyRent?.toLocaleString()}/month</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Refundable Security Deposit</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>₹{lease.securityDeposit?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(lease.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Expiry / End Date</span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{new Date(lease.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>This is a legally binding electronic tenancy claim agreement.</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Signed digitally
            </span>
          </div>
        </div>

        {/* Landlord Card Sidebar */}
        {lease.landlordId && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h4 className="font-bold text-slate-800 text-base">Your Landlord</h4>
              <p className="text-xs text-slate-500 mt-0.5">Primary contact for maintenance and dues.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                {lease.landlordId.firstName?.[0]}{lease.landlordId.lastName?.[0]}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-snug">
                  {lease.landlordId.firstName} {lease.landlordId.lastName}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase mt-1">
                  Owner
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold text-slate-700 break-all">{lease.landlordId.email}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-semibold text-slate-700">{lease.landlordId.phone}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLease;
