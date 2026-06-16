import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
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
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">Forgot Password</h2>
            <p className="text-sm text-slate-500 mt-2 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-slate-900">Check your email</h3>
                <p className="text-sm text-slate-500">
                  If {email} is registered, we've sent instructions to reset your password.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]"
              >
                Return to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e293b] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] disabled:opacity-50"
                >
                  {isLoading ? 'Sending reset link...' : 'Send reset link'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <Link to="/login" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;