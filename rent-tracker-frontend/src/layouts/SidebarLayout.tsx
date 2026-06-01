import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  Users,
  PieChart,
  CheckSquare,
  CreditCard,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  Building,
  Key,
  PlusCircle,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import api from '../api';

function SidebarLayout() {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isProfilePage = role === 'landlord'
    ? location.pathname === '/landlord/profile'
    : location.pathname === '/tenant/profile';

  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [checkingVerification, setCheckingVerification] = useState<boolean>(true);

  const fetchVerificationStatus = async () => {
    if (role === 'admin') {
      setIsVerified(true);
      setCheckingVerification(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');

      if (res.data && res.data.user) {
        setIsVerified(res.data.user.isVerified);
      }
    } catch (err) {
      console.error('Error fetching verification status in sidebar layout:', err);
    } finally {
      setCheckingVerification(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
    // Poll/check on path changes & intervals to refresh verification status seamlessly
    if (role !== 'admin') {
      const interval = setInterval(fetchVerificationStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [role, location.pathname]);

  useEffect(() => {
    if (!checkingVerification && !isVerified && role !== 'admin' && !isProfilePage) {
      navigate(role === 'landlord' ? '/landlord/profile' : '/tenant/profile');
    }
  }, [isVerified, checkingVerification, isProfilePage, role, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const landlordLinks = [
    { name: 'Dashboard', path: '/landlord/dashboard', icon: LayoutDashboard },
    { name: 'My Properties', path: '/landlord/my-properties', icon: Building },
    { name: 'Add Property', path: '/landlord/add-property', icon: PlusCircle },
    { name: 'Lease Requests', path: '/landlord/lease-requests', icon: CheckSquare },
    { name: 'Tenants', path: '/landlord/tenants', icon: Users },
    { name: 'Payments', path: '/landlord/payments', icon: CreditCard },
    { name: 'Documents', path: '/landlord/documents', icon: FolderOpen },
    { name: 'Profile', path: '/landlord/profile', icon: Settings }
  ];

  const tenantLinks = [
    { name: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { name: 'Rent Property', path: '/tenant/rent-property', icon: Building },
    { name: 'My Lease', path: '/tenant/my-lease', icon: Key },
    { name: 'Payments', path: '/tenant/payments', icon: CreditCard },
    { name: 'Documents', path: '/tenant/documents', icon: FolderOpen },
    { name: 'Profile', path: '/tenant/profile', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'AllFlats', path: '/admin/flats', icon: Home },
    { name: 'Document Verification', path: '/admin/verifications', icon: CheckSquare },
    { name: 'Leases', path: '/admin/leases', icon: Users },
    { name: 'All Document', path: '/admin/documents', icon: FolderOpen },
    { name: 'Profile Settings', path: '/admin/profile', icon: Settings },
  ];

  const links = role === 'landlord' ? landlordLinks : role === 'admin' ? adminLinks : tenantLinks;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1e293b] text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Building className="w-6 h-6 mr-3 text-[#3b82f6]" />
          <span className="text-lg font-bold tracking-wide">Tenantly</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              const Icon = link.icon;
              const isProfile = role === 'landlord' ? link.path === '/landlord/profile' : link.path === '/tenant/profile';
              const isBlocked = !isVerified && role !== 'admin' && !isProfile;

              return (
                <Link
                  key={link.path}
                  to={isBlocked ? '#' : link.path}
                  onClick={(e) => {
                    if (isBlocked) {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${isBlocked ? 'opacity-40 blur-[1px] cursor-not-allowed pointer-events-none select-none' : ''}`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{link.name}</span>
                  {isBlocked && (
                    <span className="ml-auto text-[9px] bg-slate-800/80 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono uppercase font-bold tracking-wider">
                      Locked
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Area */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800">
            {links.find(l => location.pathname.startsWith(l.path))?.name || 'Dashboard'}
          </h1>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600 capitalize">
              {role} Portal
            </span>
            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
              {role ? role.charAt(0) : 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {checkingVerification ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6] mb-4"></div>
              <p className="text-slate-500 text-sm">Validating credentials...</p>
            </div>
          ) : !isVerified && role !== 'admin' && !isProfilePage ? (
            <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-200 rounded-2xl shadow-lg p-8 space-y-6 text-center animate-fadeIn">
              <div className="mx-auto w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Identity Verification Required</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your profile is currently unverified. To safeguard the portal and enable listings/contracts, some administrative and operations features are temporarily locked.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start text-left gap-3 max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">How do I unlock these features?</span>
                  Navigate to your profile settings page, select your property, and upload a government-approved identity proof document (Aadhaar or Passport).
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate(role === 'landlord' ? '/landlord/profile' : '/tenant/profile')}
                  className="px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Go to Settings to Verify
                </button>
              </div>
            </div>
          ) : (
            <Outlet context={{ isVerified }} />
          )}
        </div>
      </main>
    </div>
  );
}

export default SidebarLayout;
