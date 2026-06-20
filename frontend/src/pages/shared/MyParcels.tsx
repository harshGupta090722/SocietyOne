import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, X, Clock, CheckCircle2, Building, Eye, Truck } from 'lucide-react';
import api from '../../api';

interface ParcelData {
  _id: string;
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

const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Other'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  ReceivedAtGate: { label: 'At Gate', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Building },
  Collected: { label: 'Collected', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

function MyParcels() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Form state
  const [platform, setPlatform] = useState('Amazon');
  const [description, setDescription] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/parcels/my');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !description.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('platform', platform);
      formData.append('description', description.trim());
      if (expectedDate) formData.append('expectedDate', expectedDate);
      if (screenshot) formData.append('document', screenshot);

      await api.post('/parcels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPlatform('Amazon');
      setDescription('');
      setExpectedDate('');
      setScreenshot(null);
      setShowForm(false);
      fetchParcels();
    } catch (err: any) {
      console.error('Error creating parcel:', err);
      alert(err.response?.data?.message || 'Failed to create parcel request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const base = (import.meta as any).env?.VITE_API_URL?.replace('/api/v1', '') || '';
    return `${base}/${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-[#3b82f6]" />
            My Parcels
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Expecting a delivery? Let the gate know in advance.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Parcel'}
        </button>
      </div>

      {/* Create Parcel Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">New Parcel Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform *</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Date (Optional)</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Amazon box — 2 items, fragile electronics. Order ID: #AB123"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Order Screenshot (Optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Parcels List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading parcels...</div>
      ) : parcels.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No parcels yet. Click "New Parcel" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcels.map((parcel) => {
            const statusCfg = STATUS_CONFIG[parcel.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={parcel._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">{parcel.platform}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-xs font-bold rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{parcel.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Created: {new Date(parcel.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {parcel.expectedDate && <span>Expected: {new Date(parcel.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {parcel.receivedAt && <span className="text-blue-500">Received: {new Date(parcel.receivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {parcel.collectedAt && <span className="text-emerald-500">Collected: {new Date(parcel.collectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    {parcel.adminNote && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-blue-700">Gate Note:</p>
                        <p className="text-xs text-blue-600 mt-0.5">{parcel.adminNote}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {parcel.orderScreenshotUrl && (
                      <button onClick={() => setLightboxUrl(getImageUrl(parcel.orderScreenshotUrl!))} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        <Eye className="w-3.5 h-3.5" /> Order
                      </button>
                    )}
                    {parcel.gatePhotoUrl && (
                      <button onClick={() => setLightboxUrl(getImageUrl(parcel.gatePhotoUrl!))} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100">
                        <Eye className="w-3.5 h-3.5" /> Gate Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

export default MyParcels;
