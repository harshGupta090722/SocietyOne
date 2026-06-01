import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Lock, Mail, AlertCircle } from 'lucide-react';
import api from '../../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'landlord' | 'tenant' | 'admin'>('tenant');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password, role });

      if (response.data && response.data.token) {
        // the backend login returns token and user data
        // For testing we will assume it returns { token, user: { _id, firstName } }
        login(
          response.data.token, 
          role, 
          response.data.user?._id || 'mock-id',
          response.data.user?.firstName
        );
        navigate(`/${role}/dashboard`);
      }
    } catch (err: any) {
      console.log("Error is", err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
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
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">Tenantly Portal</h2>
            <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-md border transition-colors ${role === 'tenant'
                  ? 'bg-[#f0fdf4] border-[#86efac] text-[#166534]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-md border transition-colors ${role === 'landlord'
                  ? 'bg-[#eff6ff] border-[#93c5fd] text-[#1e40af]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-md border transition-colors ${role === 'admin'
                  ? 'bg-[#faf5ff] border-[#d8b4fe] text-[#6b21a8]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Admin
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
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
                  placeholder="you@example.com"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6] border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e293b] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              Sign up now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
