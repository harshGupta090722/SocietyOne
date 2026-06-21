import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Clock, CheckCircle2, Building, Inbox, Truck, User, Phone } from 'lucide-react';
import api from '../../api';

interface DeliveryData {
  _id: string;
  flatId?: { flatNo: string; floor: number; block?: string };
  tenantId?: { firstName: string; lastName: string; phone: string; email: string };
  platform: string;
  partnerName: string;
  partnerPhone: string;
  status: 'Pending' | 'Verified' | 'Completed';
  verifiedAt?: string;
  completedAt?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pending: { label: 'Awaiting Verification', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  Verified: { label: 'Verified & Alert Sent', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: ShieldCheck },
  Completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

function GateVerification() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/deliveries/all');
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    
    // Poll for new deliveries every 10 seconds to act like a real gate dashboard
    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
    
  }, [fetchDeliveries]);

  const handleVerify = async (deliveryId: string) => {
    setActionLoading(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/verify`);
      fetchDeliveries();
    } catch (err: any) {
      console.error('Error verifying delivery:', err);
      alert(err.response?.data?.message || 'Failed to verify delivery.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (deliveryId: string) => {
    setActionLoading(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/complete`);
      fetchDeliveries();
    } catch (err: any) {
      console.error('Error completing delivery:', err);
      alert(err.response?.data?.message || 'Failed to complete delivery.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDeliveries = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);

  const counts = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'Pending').length,
    verified: deliveries.filter(d => d.status === 'Verified').length,
    completed: deliveries.filter(d => d.status === 'Completed').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#3b82f6]" />
          Gate Verification
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Verify incoming delivery partners (Swiggy, Zomato, etc.) and automatically alert residents.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{counts.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Awaiting Verification</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Verified (In Premises)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counts.verified}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit border border-slate-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'Pending', label: 'Awaiting' },
          { key: 'Verified', label: 'Verified' },
          { key: 'Completed', label: 'Completed' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              filter === f.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && deliveries.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading delivery data...</div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No deliveries found.</p>
          <p className="text-xs text-slate-400 mt-1">Simulated webhook deliveries will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((delivery) => {
            const statusCfg = STATUS_CONFIG[delivery.status];
            const StatusIcon = statusCfg.icon;
            const flat = delivery.flatId;
            const tenant = delivery.tenantId;

            return (
              <div key={delivery._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-800">{delivery.platform}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-bold uppercase tracking-wide rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 space-y-4">
                  {/* Destination Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Destination Flat</p>
                      <p className="font-bold text-slate-800 text-lg">
                        {flat ? flat.flatNo : 'Unknown'}
                      </p>
                      {tenant && (
                        <p className="text-sm text-slate-600 mt-0.5">
                          Tenant: {tenant.firstName} {tenant.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Delivery Partner</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{delivery.partnerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{delivery.partnerPhone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 text-right">
                    Arrived: {new Date(delivery.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 mt-auto">
                  {delivery.status === 'Pending' && (
                    <button
                      onClick={() => handleVerify(delivery._id)}
                      disabled={actionLoading === delivery._id}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {actionLoading === delivery._id ? 'Verifying...' : 'Verify & Alert Tenant'}
                    </button>
                  )}
                  {delivery.status === 'Verified' && (
                    <button
                      onClick={() => handleComplete(delivery._id)}
                      disabled={actionLoading === delivery._id}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionLoading === delivery._id ? 'Completing...' : 'Mark as Completed'}
                    </button>
                  )}
                  {delivery.status === 'Completed' && (
                    <div className="w-full text-center py-2.5 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                      Delivered
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GateVerification;