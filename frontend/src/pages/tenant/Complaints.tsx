import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareWarning, Send, Inbox } from 'lucide-react';
import api from '../../api';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import type { ComplaintData } from '../../components/complaints/ComplaintCard';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';

const TENANT_TARGETS = [
  { label: 'To Admin (Society Issues)', value: 'admin', category: 'society' },
  { label: 'To Landlord (Flat Issues)', value: 'landlord', category: 'flat' },
  { label: 'To Another Tenant', value: 'tenant', category: 'tenant-notice', requiresFlatNo: true },
];

function TenantComplaints() {
  const [activeTab, setActiveTab] = useState<'send' | 'received'>('send');
  const [sentComplaints, setSentComplaints] = useState<ComplaintData[]>([]);
  const [receivedComplaints, setReceivedComplaints] = useState<ComplaintData[]>([]);
  const [sentFilter, setSentFilter] = useState('all');
  const [receivedFilter, setReceivedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [flatAssigned, setFlatAssigned] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes, dashRes] = await Promise.all([
        api.get('/complaints/sent'),
        api.get('/complaints/received'),
        api.get('/tenant/dashboard').catch(() => ({ data: { flatAssigned: false } })),
      ]);
      setSentComplaints(sentRes.data.data || []);
      setReceivedComplaints(receivedRes.data.data || []);
      setFlatAssigned(dashRes.data.flatAssigned || false);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filterComplaints = (complaints: ComplaintData[], filter: string) => {
    if (filter === 'all') return complaints;
    return complaints.filter((c) => c.status === filter);
  };

  const filteredSent = filterComplaints(sentComplaints, sentFilter);
  const filteredReceived = filterComplaints(receivedComplaints, receivedFilter);

  const sentCounts = {
    total: sentComplaints.length,
    open: sentComplaints.filter((c) => c.status === 'open').length,
    in_progress: sentComplaints.filter((c) => c.status === 'in_progress').length,
    resolved: sentComplaints.filter((c) => c.status === 'resolved').length,
  };

  const receivedCounts = {
    total: receivedComplaints.length,
    open: receivedComplaints.filter((c) => c.status === 'open').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquareWarning className="w-7 h-7 text-[#3b82f6]" />
          Complaints
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Report issues to your landlord or society admin, and view complaints received from others.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Total Sent</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{sentCounts.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Open</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{sentCounts.open}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{sentCounts.in_progress}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Received</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{receivedCounts.total}</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeTab === 'send'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          Send Complaint
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeTab === 'received'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received
          {receivedCounts.open > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {receivedCounts.open}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Complaint Form */}
          <ComplaintForm 
            targets={TENANT_TARGETS.map(t => 
              t.value === 'landlord' && !flatAssigned 
                ? { ...t, disabled: true, disabledMessage: "You don't have any landlord yet." } 
                : t
            )} 
            onSuccess={fetchComplaints} 
          />

          {/* My Previous Complaints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">My Previous Complaints</h3>
              <ComplaintFilters activeFilter={sentFilter} onFilterChange={setSentFilter} />
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading complaints...</div>
            ) : filteredSent.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No complaints found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSent.map((c) => (
                  <ComplaintCard key={c._id} complaint={c} variant="sent" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Complaints Received</h3>
            <ComplaintFilters activeFilter={receivedFilter} onFilterChange={setReceivedFilter} />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading complaints...</div>
          ) : filteredReceived.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No complaints received yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReceived.map((c) => (
                <ComplaintCard key={c._id} complaint={c} variant="received" onStatusUpdate={fetchComplaints} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TenantComplaints;
