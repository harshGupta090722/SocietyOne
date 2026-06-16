import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

function Signup() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'tenant' as 'tenant' | 'landlord'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the inline error for this field as the user corrects it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsLoading(true);

    try {
      await api.post('/auth/signup', formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#e2e8f0] overflow-hidden">

        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="h-12 w-12 bg-[#1e293b] rounded-lg flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 mt-2">Join SocietyOne today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'tenant' })}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-md border transition-colors ${formData.role === 'tenant'
                  ? 'bg-[#f0fdf4] border-[#86efac] text-[#166534]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'landlord' })}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-md border transition-colors ${formData.role === 'landlord'
                  ? 'bg-[#eff6ff] border-[#93c5fd] text-[#1e40af]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Landlord
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                    placeholder="Harsh"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                    placeholder="Gupta"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-md shadow-sm sm:text-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] ${
                    fieldErrors.phone ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="10-digit mobile number"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e293b] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;
