import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Calendar, AlertCircle } from 'lucide-react';
import api from '../../api';

interface AdminDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  isVerified: boolean;
  createdAt?: string;
}

function Profile() {
  const [admin, setAdmin] = useState<AdminDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/admin/profile');
        if (response.data.success) {
          setAdmin(response.data.adminDetails);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch administrator profile details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-slate-500">Loading profile details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      ) : admin && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          
          {/* Accent Header */}
          <div className="h-32 bg-slate-900 flex items-end p-6 relative">
            <div className="absolute -bottom-10 left-6 h-20 w-20 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-md text-2xl font-bold uppercase">
              {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
            </div>
          </div>

          {/* Profile Context */}
          <div className="pt-14 p-6 space-y-6">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {admin.firstName} {admin.lastName}
                </h2>
                <span className="flex items-center text-xs font-bold text-blue-700 bg-blue-50 py-1 px-2.5 rounded-full border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Authorized Admin
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">System Administrator & Moderator</p>
            </div>

            {/* Profile Grid fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Email Address</span>
                  <span className="text-sm font-semibold text-slate-700">{admin.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Contact Number</span>
                  <span className="text-sm font-semibold text-slate-700">{admin.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Account ID</span>
                  <span className="text-xs font-mono text-slate-500 break-all">{admin._id}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">System Status</span>
                  <span className="text-sm font-semibold text-emerald-600 flex items-center">
                    Active Session
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
