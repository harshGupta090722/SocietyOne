import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareWarning, Send, Inbox, Building } from 'lucide-react';
import api from '../../api';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import type { ComplaintData } from '../../components/complaints/ComplaintCard';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';

const LANDLORD_TARGETS = [
  { label: 'To Admin (Society Issues)', value: 'admin', category: 'society' },
  { label: 'To Tenant (Notice / Warning)', value: 'tenant', category: 'tenant-notice', requiresFlatNo: true },
];

function LandlordComplaints() {
  const [activeTab, setActiveTab] = useState<'received' | 'send'>('received');
  const [sentComplaints, setSentComplaints] = useState<ComplaintData[]>([]);
  const [receivedComplaints, setReceivedComplaints] = useState<ComplaintData[]>([]);
  const [sentFilter, setSentFilter] = useState('all');
  const [receivedFilter, setReceivedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        api.get('/complaints/sent'),
        api.get('/complaints/received'),
      ]);
      setSentComplaints(sentRes.data.data || []);
      setReceivedComplaints(receivedRes.data.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const filterComplaints = (list: ComplaintData[], f: string) =>
    f === 'all' ? list : list.filter((c) => c.status === f);

  const filteredSent = filterComplaints(sentComplaints, sentFilter);
  const filteredReceived = filterComplaints(receivedComplaints, receivedFilter);

  const rc = {
    total: receivedComplaints.length,
    open: receivedComplaints.filter((c) => c.status === 'open').length,
    in_progress: receivedComplaints.filter((c) => c.status === 'in_progress').length,
    resolved: receivedComplaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquareWarning className="w-7 h-7 text-[#3b82f6]" />
          Complaints Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">Receive and resolve tenant complaints, or raise issues to the society admin.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Received', val: rc.total, color: 'text-slate-800' },
          { label: 'Open', val: rc.open, color: 'text-amber-600' },
          { label: 'In Progress', val: rc.in_progress, color: 'text-blue-600' },
          { label: 'Resolved', val: rc.resolved, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab('received')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'received' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Inbox className="w-4 h-4" /> Received & Resolve
          {rc.open > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{rc.open}</span>}
        </button>
        <button onClick={() => setActiveTab('send')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'send' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Send className="w-4 h-4" /> Create Complaint
        </button>
      </div>

      {activeTab === 'received' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Building className="w-5 h-5 text-slate-400" />Tenant Complaints</h3>
            <ComplaintFilters activeFilter={receivedFilter} onFilterChange={setReceivedFilter} />
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading complaints...</div>
          ) : filteredReceived.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No complaints received yet. Your tenants are happy!</p>
            </div>
          ) : (
            <div className="space-y-3">{filteredReceived.map((c) => <ComplaintCard key={c._id} complaint={c} variant="received" onStatusUpdate={fetchComplaints} />)}</div>
          )}
        </div>
      )}

      {activeTab === 'send' && (
        <div className="space-y-6">
          <ComplaintForm targets={LANDLORD_TARGETS} onSuccess={fetchComplaints} />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">My Complaints</h3>
              <ComplaintFilters activeFilter={sentFilter} onFilterChange={setSentFilter} />
            </div>
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading...</div>
            ) : filteredSent.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">You haven't submitted any complaints.</p>
              </div>
            ) : (
              <div className="space-y-3">{filteredSent.map((c) => <ComplaintCard key={c._id} complaint={c} variant="sent" />)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordComplaints;
