import React, { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle2, Building, Eye, X, Camera, Inbox } from 'lucide-react';
import api from '../../api';

interface ParcelData {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; email: string; phone: string };
  flatId?: { flatNumber: string; floor: number; block?: string };
  platform: string;
  description: string;
  expectedDate?: string;
  orderScreenshotUrl?: string;
  status: 'Pending' | 'ReceivedAtGate' | 'Collected';
  gatePhotoUrl?: string;
  receivedAt?: string;
  collectedAt?: string;
  adminNote?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  ReceivedAtGate: { label: 'At Gate', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Building },
  Collected: { label: 'Collected', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

function AdminParcels() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Receive modal state
  const [receiveModal, setReceiveModal] = useState<string | null>(null);
  const [gatePhoto, setGatePhoto] = useState<File | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/parcels/all');
      setParcels(res.data.parcels || []);
    } catch (err) {
      console.error('Error fetching parcels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const handleReceive = async (parcelId: string) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      
      if (gatePhoto) formData.append('document', gatePhoto);
      if (adminNote.trim()) formData.append('adminNote', adminNote.trim());

      await api.patch(`/parcels/${parcelId}/receive`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReceiveModal(null);
      setGatePhoto(null);
      setAdminNote('');
      fetchParcels();
    } catch (err: any) {
      console.error('Error receiving parcel:', err);
      alert(err.response?.data?.message || 'Failed to receive parcel.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollect = async (parcelId: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/parcels/${parcelId}/collect`);
      fetchParcels();
    } catch (err: any) {
      console.error('Error collecting parcel:', err);
      alert(err.response?.data?.message || 'Failed to mark as collected.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredParcels = filter === 'all' ? parcels : parcels.filter(p => p.status === filter);

  const counts = {
    total: parcels.length,
    pending: parcels.filter(p => p.status === 'Pending').length,
    atGate: parcels.filter(p => p.status === 'ReceivedAtGate').length,
    collected: parcels.filter(p => p.status === 'Collected').length,
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const base = (import.meta as any).env?.VITE_API_URL?.replace('/api/v1', '') || '';
    return `${base}/${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-[#3b82f6]" />
          Gate Parcels
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage incoming packages for residents. Receive, photograph, and hand over parcels.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{counts.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Awaiting Arrival</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Held at Gate</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counts.atGate}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.collected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'Pending', label: 'Awaiting' },
          { key: 'ReceivedAtGate', label: 'At Gate' },
          { key: 'Collected', label: 'Collected' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              filter === f.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Parcels List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading parcels...</div>
      ) : filteredParcels.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No parcels found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParcels.map((parcel) => {
            const statusCfg = STATUS_CONFIG[parcel.status];
            const StatusIcon = statusCfg.icon;
            const resident = parcel.userId;
            const flat = parcel.flatId;

            return (
              <div key={parcel._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Resident Info + Status */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">
                        {resident?.firstName} {resident?.lastName}
                      </span>
                      {flat && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                          Flat {flat.flatNumber}{flat.floor !== undefined ? `, Floor ${flat.floor}` : ''}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                        {parcel.platform}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-xs font-bold rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-2">{parcel.description}</p>

                    {/* Contact */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>{resident?.phone}</span>
                      <span>{resident?.email}</span>
                      <span>Created: {new Date(parcel.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {parcel.expectedDate && <span>Expected: {new Date(parcel.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>

                    {/* Admin Note */}
                    {parcel.adminNote && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-blue-700">Gate Note:</p>
                        <p className="text-xs text-blue-600 mt-0.5">{parcel.adminNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {parcel.orderScreenshotUrl && (
                      <button
                        onClick={() => setLightboxUrl(getImageUrl(parcel.orderScreenshotUrl!))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> Order
                      </button>
                    )}
                    {parcel.gatePhotoUrl && (
                      <button
                        onClick={() => setLightboxUrl(getImageUrl(parcel.gatePhotoUrl!))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" /> Photo
                      </button>
                    )}
                    {parcel.status === 'Pending' && (
                      <button
                        onClick={() => setReceiveModal(parcel._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        <Camera className="w-3.5 h-3.5" /> Receive
                      </button>
                    )}
                    {parcel.status === 'ReceivedAtGate' && (
                      <button
                        onClick={() => handleCollect(parcel._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receive Modal */}
      {receiveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReceiveModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Receive Parcel</h3>
              <button onClick={() => setReceiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Photo of Package (Optional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setGatePhoto(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Note (Optional)</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Kept near staircase"
                maxLength={300}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setReceiveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
              <button
                onClick={() => handleReceive(receiveModal)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {actionLoading ? 'Saving...' : 'Confirm Received'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-3xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxUrl(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-slate-100 z-10">
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <img src={lightboxUrl} alt="Document preview" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminParcels;
