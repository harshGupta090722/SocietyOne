import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, User, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../api';
import { getUploadUrl } from '../../utils/fileUrl';

interface ComplaintData {
  _id: string;
  complainantId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  respondentId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  targetRole: string;
  category: string;
  subject: string;
  description: string;
  images: string[];
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
  resolutionNote?: string;
  flatId?: { flatNo: string } | null;
  isNotice?: boolean;
  priority?: 'low' | 'moderate' | 'critical';
  createdAt: string;
  updatedAt: string;
}

interface ComplaintCardProps {
  complaint: ComplaintData;
  variant: 'sent' | 'received';
  onStatusUpdate?: () => void;
  apiBaseUrl?: string;
}

const statusConfig = {
  open: {
    label: 'Open',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const priorityConfig = {
  low: {
    label: 'Low Priority',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  moderate: {
    label: 'Moderate Priority',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  critical: {
    label: 'Critical Priority',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

function ComplaintCard({ complaint, variant, onStatusUpdate, apiBaseUrl }: ComplaintCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const config = statusConfig[complaint.status];
  const senderName = complaint.complainantId
    ? `${complaint.complainantId.firstName} ${complaint.complainantId.lastName}`
    : 'Unknown';
  const senderRole = complaint.complainantId?.role || '';

  const recipientName = complaint.respondentId
    ? `${complaint.respondentId.firstName} ${complaint.respondentId.lastName}`
    : complaint.targetRole.charAt(0).toUpperCase() + complaint.targetRole.slice(1);

  const handleStatusUpdate = async (newStatus: 'in_progress' | 'resolved') => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        resolutionNote: newStatus === 'resolved' ? resolutionNote : undefined,
      });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Build image URL — handle both absolute URLs and relative /uploads/ paths
  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (apiBaseUrl) return `${apiBaseUrl}${path}`;
    return getUploadUrl(path);
  };

  const isNotice = complaint.isNotice;
  const displayConfig = isNotice ? priorityConfig[complaint.priority || 'moderate'] : config;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header Row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Status dot */}
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${displayConfig.dot}`} />

          {/* Subject & meta */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{complaint.subject}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <User className="w-3 h-3" />
              {variant === 'sent' ? (
                <span>To: <span className="font-medium text-slate-600">{recipientName}</span></span>
              ) : (
                <span>From: <span className="font-medium text-slate-600">{senderName}</span> <span className="text-slate-400 capitalize">({senderRole})</span></span>
              )}
              <span className="text-slate-300">•</span>
              <Clock className="w-3 h-3" />
              <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {complaint.flatId && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium">Flat {complaint.flatId.flatNo}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {/* Status badge */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${displayConfig.bg} ${displayConfig.text} ${displayConfig.border} border`}>
            {displayConfig.label}
          </span>

          {complaint.images.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ImageIcon className="w-3.5 h-3.5" />
              {complaint.images.length}
            </div>
          )}

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Images */}
          {complaint.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attachments</p>
              <div className="flex gap-3 flex-wrap">
                {complaint.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={getImageUrl(img)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 hover:border-[#3b82f6] transition-colors block"
                  >
                    <img src={getImageUrl(img)} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="flex gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider">Category: </span>
              <span className="text-slate-700 capitalize">{complaint.category.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Resolution note (if resolved) */}
          {complaint.status === 'resolved' && complaint.resolutionNote && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolution Note
              </p>
              <p className="text-sm text-emerald-700">{complaint.resolutionNote}</p>
              {complaint.resolvedAt && (
                <p className="text-xs text-emerald-500 mt-1">
                  Resolved on {new Date(complaint.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Action buttons — only for received + not yet resolved + NOT A NOTICE */}
          {variant === 'received' && complaint.status !== 'resolved' && !isNotice && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {complaint.status === 'open' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Mark as In Progress
                </button>
              )}

              <div className="space-y-2">
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add a resolution note (optional)..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
                />
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Resolve Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplaintCard;
export type { ComplaintData };
