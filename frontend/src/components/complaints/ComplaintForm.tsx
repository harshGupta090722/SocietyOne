import React, { useState } from 'react';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';
import api from '../../api';

interface TargetOption {
  label: string;
  value: string;
  category: string;
  requiresFlatNo?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

interface ComplaintFormProps {
  targets: TargetOption[];
  onSuccess: () => void;
}

function ComplaintForm({ targets, onSuccess }: ComplaintFormProps) {
  const [targetRole, setTargetRole] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedTarget = targets.find((t) => t.value === targetRole);
  const showFlatNo = selectedTarget?.requiresFlatNo;

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 3 - images.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!targetRole || !subject.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (showFlatNo && !flatNo.trim()) {
      setError('Please provide the Flat Number for this recipient.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('targetRole', targetRole);
      formData.append('category', selectedTarget?.category || 'other');
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      if (showFlatNo && flatNo.trim()) {
        formData.append('flatNo', flatNo.trim());
      }

      images.forEach((img) => {
        formData.append('images', img);
      });

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Complaint submitted successfully!');
      setTargetRole('');
      setSubject('');
      setDescription('');
      setFlatNo('');
      previews.forEach((p) => URL.revokeObjectURL(p));
      setImages([]);
      setPreviews([]);
      onSuccess();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Send className="w-5 h-5 text-[#3b82f6]" />
        Submit a Complaint
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          {successMsg}
        </div>
      )}

      {/* Send To */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Send To *</label>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition"
        >
          <option value="">Select recipient...</option>
          {targets.map((t) => (
            <option key={t.value} value={t.value} disabled={t.disabled}>
              {t.label}
            </option>
          ))}
        </select>
        {targets.some(t => t.disabled) && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            * {targets.find(t => t.disabled)?.disabledMessage}
          </p>
        )}
      </div>

      {/* Flat Number (Conditional) */}
      {showFlatNo && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Flat Number *</label>
          <input
            type="text"
            value={flatNo}
            onChange={(e) => setFlatNo(e.target.value)}
            placeholder="e.g. A-101"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition"
          />
          <p className="text-xs text-slate-500 mt-1">Required to identify the correct recipient.</p>
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief title for your complaint"
          maxLength={200}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your issue in detail..."
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition resize-none"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{description.length}/2000</p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Attach Images <span className="text-slate-400 font-normal">(up to 3)</span>
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          {previews.map((src, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
              <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}

          {images.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#3b82f6] hover:bg-blue-50/50 transition-colors">
              <ImagePlus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] text-slate-400 mt-1">Add</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Complaint
          </>
        )}
      </button>
    </form>
  );
}

export default ComplaintForm;
