import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Fingerprint, 
  AlertCircle, 
  CheckCircle2, 
  Building,
  UserCheck2
} from 'lucide-react';
import api from '../../api';
import { useOutletContext } from 'react-router-dom';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone: string;
  isVerified: boolean;
  createdAt?: string;
}

function LandlordProfile() {
  const { isVerified } = useOutletContext<{ isVerified: boolean }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('');
  const [verifyErrorMsg, setVerifyErrorMsg] = useState('');

  const fetchProfileAndProperties = async () => {
    try {
      const profileRes = await api.get('/landlord/profile');
      if (profileRes.data && profileRes.data.user) {
        setProfile(profileRes.data.user);
        if (profileRes.data.verification) {
          setVerification(profileRes.data.verification);
        } else {
          setVerification(null);
        }
      } else {
        setError('Profile data structure unexpected.');
      }
    } catch (err: any) {
      console.error('Error fetching landlord data:', err);
      setError(err.response?.data?.message || 'Failed to fetch landlord details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndProperties();
  }, [isVerified]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifySuccessMsg('');
    setVerifyErrorMsg('');

    if (!selectedFile) {
      setVerifyErrorMsg('Identity proof document is required for verification.');
      return;
    }

    setIsVerifying(true);
    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await api.post('/landlord/identityVerification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.verification) {
        setVerifySuccessMsg('Verification request submitted successfully! Status is now pending approval.');
        setSelectedFile(null);
        await fetchProfileAndProperties();
      }
    } catch (err: any) {
      console.error('Error submitting identity verification:', err);
      setVerifyErrorMsg(err.response?.data?.message || 'Failed to submit identity verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563eb] mb-4"></div>
        <p className="text-slate-500 text-sm">Loading your profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start text-rose-700 text-sm font-sans mt-8 shadow-sm">
        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-rose-800 block mb-1">Error Loading Profile</span>
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const effectiveStatus = (verification && !profile.isVerified && verification.status === 'approved')
    ? 'unverified'
    : verification?.status;

  return (
    <div className="max-w-3xl mx-auto font-sans p-2 bg-[#f8fafc] min-h-[calc(100vh-120px)] pb-12">
      
      {/* Profile Header Block */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8 transition-shadow hover:shadow-md duration-300">
        
        {/* Accent Banner with Gradient */}
        <div className="h-36 bg-gradient-to-r from-slate-800 to-slate-950 flex items-end p-6 relative rounded-t-2xl">
          {/* Large Initials Avatar */}
          <div className="absolute -bottom-12 left-8 h-24 w-24 bg-[#2563eb] rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg text-3xl font-bold uppercase transition-transform duration-300 hover:scale-105">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
        </div>

        {/* Profile General Context */}
        <div className="pt-16 p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h2>
                
                {/* Verification Badge */}
                {!profile.isVerified && (
                  verification?.status === 'pending' ? (
                    <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 py-1 px-3 rounded-full border border-amber-200 shadow-sm animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Pending Verification
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 py-1 px-3 rounded-full border border-rose-200 shadow-sm">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      Unverified
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 capitalize font-medium flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                Registered {profile.role} Portal Member
              </p>
            </div>

            {/* Quick Status Action / Indicator */}
            <div>
              {!profile.isVerified && (
                verification?.status === 'pending' ? (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Verification Status</span>
                    <span className="text-sm font-semibold text-amber-600 flex items-center justify-end gap-1 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> Under Admin Review
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Verification Status</span>
                    <span className="text-sm font-semibold text-rose-500 flex items-center justify-end gap-1 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" /> Action Required
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Verification Call-out banner */}
          {profile.isVerified ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start text-emerald-800 text-sm">
              <ShieldCheck className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-900 block mb-0.5">Verified Landlord Account</span>
                Your landlord profile has been officially verified by the society administrator. You have full access to list society flats, generate lease agreements, and manage tenant records.
              </div>
            </div>
          ) : verification?.status === 'pending' ? (
            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900 block mb-0.5">Verification Request Submitted</span>
                Your identity proof document is currently pending administrative approval. An administrator is reviewing your details and property claim.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex items-start text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-900 block mb-0.5">Account Pending Verification</span>
                Your landlord profile is currently unverified. Some administrative capabilities, such as listing new properties and finalizing leases, will be restricted until an Administrator approves your account.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Fields Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-8 animate-fadeIn">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Account Credentials & Personal Details</h3>
          <p className="text-xs text-slate-500 mt-1">Official registry details registered on Tenantly platform.</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
          
          {/* First Name */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">First Name</span>
              <span className="text-sm font-semibold text-slate-800">{profile.firstName}</span>
            </div>
          </div>

          {/* Last Name */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Last Name</span>
              <span className="text-sm font-semibold text-slate-800">{profile.lastName}</span>
            </div>
          </div>

          {/* Email Address */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Email Address</span>
              <span className="text-sm font-semibold text-slate-800 truncate block">{profile.email}</span>
            </div>
          </div>

          {/* Contact Number */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Contact Number</span>
              <span className="text-sm font-semibold text-slate-800">{profile.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Password (Masked for Security) */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Password Credentials</span>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                ••••••••
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono font-normal">Hashed</span>
              </span>
            </div>
          </div>

          {/* Role Identifier */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200">
            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Account Role</span>
              <span className="text-sm font-semibold text-[#2563eb] capitalize">{profile.role}</span>
            </div>
          </div>

          {/* Account System ID */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all duration-200 md:col-span-2">
            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Database Unique ID</span>
              <span className="text-xs font-mono text-slate-500 break-all select-all block mt-0.5">{profile._id}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Identity Verification Form Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6 mt-8 animate-fadeIn">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-600 animate-pulse" />
            Identity Verification & Claim Property
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Submit your official government ID proof (Aadhaar or Passport) to verify your landlord status and associate your claimed flats.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          {verification ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">Verification Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                    effectiveStatus === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (effectiveStatus === 'rejected' || effectiveStatus === 'unverified')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  }`}>
                    {effectiveStatus}
                  </span>
                </div>

                {verification.flatId && (
                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                    <span className="text-slate-500 font-medium">Claimed Property:</span>
                    <span className="font-semibold text-slate-700">
                      Flat {verification.flatId.flatNo || 'Associated'}
                    </span>
                  </div>
                )}

                {profile.isVerified && (
                  <div className="text-sm text-emerald-600 font-semibold mt-2">
                    You Are verified
                  </div>
                )}

                {verification.status === 'rejected' && verification.rejectionReason && (
                  <div className="p-3 bg-red-50/50 border border-red-100 text-red-700 rounded-lg text-xs">
                    <span className="font-bold block mb-1">Rejection Reason:</span>
                    {verification.rejectionReason}
                  </div>
                )}

                {!profile.isVerified && verification.status === 'approved' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-medium">
                    <span className="font-bold block mb-1">Status Note:</span>
                    Your verification status has been revoked/reset by the administrator. Please re-submit your identity proof.
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 mt-6">
                <h4 className="text-sm font-bold text-slate-800">
                  {profile.isVerified ? 'Verification Details' : 'Re-submit Verification Request'}
                </h4>
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  {/* File Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Upload Identity Proof (Aadhaar / Passport)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={profile.isVerified || effectiveStatus === 'pending'}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className={`w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        (profile.isVerified || effectiveStatus === 'pending') ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer'
                      }`}
                    />
                  </div>

                  {verifyErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-medium">
                      {verifyErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || profile.isVerified || effectiveStatus === 'pending'}
                    className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Submitting Request...' : 'Get Verified'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {profile.isVerified && (
                <div className="text-sm text-emerald-600 font-semibold mb-2">
                  You Are verified
                </div>
              )}
              {/* File Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Upload Identity Proof (Aadhaar / Passport)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  disabled={profile.isVerified}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className={`w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                    profile.isVerified ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer'
                  }`}
                />
              </div>

              {verifySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-medium">
                  {verifySuccessMsg}
                </div>
              )}

              {verifyErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-medium">
                  {verifyErrorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || profile.isVerified}
                className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Submitting Request...' : 'Get Verified'}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default LandlordProfile;