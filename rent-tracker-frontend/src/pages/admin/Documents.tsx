import React, { useEffect, useState } from 'react';
import { FolderOpen, FileText, Download, ShieldCheck, Home, RefreshCw, Eye } from 'lucide-react';
import api from '../../api';

interface Document {
  _id: string;
  leaseId?: {
    _id: string;
    flatId?: {
      flatNo: string;
    };
    tenantId?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    landlordId?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  rentAgreementUrl: string;
  policeVerificationUrl: string;
  createdAt: string;
}

function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lightbox Modal for PDFs/Images
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/documents');
      if (response.data.success) {
        setDocuments(response.data.allDocuments || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch society document vault.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:4000/${path.replace(/\\/g, '/')}`;
  };

  const handleView = (path: string) => {
    const url = getFullUrl(path);
    if (url.endsWith('.pdf') || url.endsWith('.doc') || url.endsWith('.docx')) {
      // PDF documents should open in a new browser tab for clean viewing/printing
      window.open(url, '_blank');
    } else {
      // Image documents can render inside our clean lightbox preview modal
      setLightboxUrl(url);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Document Vault</h2>
          <p className="text-sm text-slate-500 mt-1">
            Society digital safe containing all rent agreements and police verification forms.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="animate-pulse text-slate-500 text-lg font-medium">Opening safe...</div>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-red-500">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
          No files or certificates are currently stored in the society vault.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
              
              {/* Header Context */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm font-bold text-slate-800 bg-slate-100 py-1 px-2.5 rounded">
                    <Home className="w-4 h-4 mr-1.5 text-slate-500" />
                    Flat {doc.leaseId?.flatId?.flatNo || 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase">Tenant</span>
                    <span className="text-slate-700 font-bold mt-1 block">
                      {doc.leaseId?.tenantId ? `${doc.leaseId.tenantId.firstName} ${doc.leaseId.tenantId.lastName}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase">Landlord</span>
                    <span className="text-slate-700 font-bold mt-1 block">
                      {doc.leaseId?.landlordId ? `${doc.leaseId.landlordId.firstName} ${doc.leaseId.landlordId.lastName}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between items-start">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">Rent Agreement</span>
                  </div>
                  {doc.rentAgreementUrl ? (
                    <button
                      onClick={() => handleView(doc.rentAgreementUrl)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View document
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic mt-3">Not uploaded</span>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between items-start">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold">Police Form</span>
                  </div>
                  {doc.policeVerificationUrl ? (
                    <button
                      onClick={() => handleView(doc.policeVerificationUrl)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View document
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic mt-3">Not uploaded</span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center bg-white/5 p-4 rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white rounded-full p-2 border border-white/20 hover:bg-slate-800 transition-colors z-10 font-bold"
            >
              ✕
            </button>
            <img
              src={lightboxUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
