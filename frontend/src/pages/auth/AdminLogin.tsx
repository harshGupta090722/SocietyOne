import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Hardcode the role to 'admin'
      const response = await api.post('/auth/login', { email, password, role: 'admin' });

      if (response.data && response.data.token) {
        login(
          response.data.token,
          'admin',
          response.data.user?._id || 'mock-id',
          response.data.user?.firstName
        );
        navigate(`/admin/dashboard`);
      }
    } catch (err: any) {
      console.log("Error is", err);
      setError(err.response?.data?.message || 'Failed to login as admin. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#e2e8f0] overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="h-12 w-12 bg-[#1e293b] rounded-lg flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">Admin Access</h2>
            <p className="text-sm text-slate-500 mt-2">Restricted Area</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e293b] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;