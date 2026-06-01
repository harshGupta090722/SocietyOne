import { useEffect, useState } from 'react';
import { LayoutDashboard, ShieldAlert, Key, FolderOpen, ArrowRight, ShieldCheck, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

interface Stats {
  totalFlats: number;
  occupiedFlats: number;
  vacantFlats: number;
  unAssignedFlats: number;
}

interface Verification {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
  };
  idProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, verificationsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/document-verifications'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data);
        }

        if (verificationsRes.data.success) {
          setVerifications(verificationsRes.data.verifications);
        }

        console.log("Harsh ", "statsRes.data", statsRes.data, "verificationsRes.data", verificationsRes.data);

      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch dashboard intelligence.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-slate-500">Loading Dashboard stats...</div>
      </div>
    );
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-8 font-sans">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Total society Inventory</span>
            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats?.totalFlats ?? 500}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Occupied Units</span>
            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats?.occupiedFlats ?? 0}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Vacant Units</span>
            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats?.vacantFlats ?? 0}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Pending Approvals</span>
            <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{pendingCount}</div>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Verification Queue (Col-Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-slate-500" />
              Pending Identity Verifications
            </h2>
            <Link to="/admin/verifications" className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-colors">
              Go to queue <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {verifications.filter(v => v.status === 'pending').slice(0, 3).length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500 text-sm">
                No verifications currently pending. Society records are up to date!
              </div>
            ) : (
              verifications.filter(v => v.status === 'pending').slice(0, 3).map((v) => (
                <div key={v._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {v.userId?.firstName} {v.userId?.lastName}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Role: <span className="capitalize font-semibold text-slate-700">{v.userId?.role}</span> • {v.userId?.email}
                    </div>
                  </div>
                  <Link
                    to="/admin/verifications"
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    Review Proof
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Activity / Quick links */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center">
            <LayoutDashboard className="w-5 h-5 mr-2 text-slate-500" />
            Quick Admin Actions
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/admin/flats"
              className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center mr-3">
                <Home className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Inspect Flats Inventory</div>
                <div className="text-xs text-slate-400">View flat configurations and occupants</div>
              </div>
            </Link>

            <Link
              to="/admin/leases"
              className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center mr-3">
                <Key className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Lease Ledger</div>
                <div className="text-xs text-slate-400">Audit current lease terms & tenancies</div>
              </div>
            </Link>

            <Link
              to="/admin/documents"
              className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center mr-3">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Document Vault</div>
                <div className="text-xs text-slate-400">Police verifications & agreements</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;