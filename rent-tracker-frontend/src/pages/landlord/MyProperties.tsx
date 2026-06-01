import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  Building, 
  DollarSign, 
  Users,
  Info, 
  Home, 
  ArrowRight,
  Loader2,
  FileText,
  History,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TenantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface LeaseInfo {
  _id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  tenantId: TenantInfo;
}

interface Flat {
  _id: string;
  flatNo: string;
  ownerId?: string | null;
  leaseId?: LeaseInfo | null;
  monthlyRent?: string;
  securityDeposit?: string;
  status: 'unassigned' | 'vacant' | 'occupied';
  isApproved: 'notApproved' | 'pending' | 'approved';
}

interface PaymentRecord {
  paymentId: string;
  leaseId: {
    _id: string;
    flatId: {
      _id: string;
      flatNo: string;
    };
  };
  tenantId: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  documentUrl?: string;
  rentMonth?: string;
}

function MyProperties() {
  const [properties, setProperties] = useState<Flat[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Flat | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'documents' | 'history' | null>(null);
  const [modalPayments, setModalPayments] = useState<PaymentRecord[]>([]);
  const [ownershipDoc, setOwnershipDoc] = useState<string>('');

  const fetchPropertiesAndPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch properties
      const propRes = await api.get('/landlord/properties');
      if (propRes.data && propRes.data.flats) {
        setProperties(propRes.data.flats);
      }

      // 2. Fetch payments (for historical lookup)
      const payRes = await api.get('/landlord/payments');
      if (payRes.data && payRes.data.payments) {
        setAllPayments(payRes.data.payments);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load properties details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertiesAndPayments();
  }, []);

  const openModal = async (property: Flat, type: 'details' | 'documents' | 'history') => {
    setSelectedProperty(property);
    setActiveModal(type);

    if (type === 'history') {
      // Filter payments that belong to this flat's lease
      if (property.leaseId) {
        const filtered = allPayments.filter(p => p.leaseId?._id === property.leaseId?._id);
        setModalPayments(filtered);
      } else {
        setModalPayments([]);
      }
    } else if (type === 'documents') {
      setOwnershipDoc('');
      try {
        // Fetch verifications to find the ownership document uploaded for this flat
        const verifRes = await api.get('/landlord/profile');
        if (verifRes.data && verifRes.data.verification) {
          // Check if user has uploaded ownership docs. Since we populated verification type,
          // let's fetch all verifications from profile or filter them.
          // Alternatively, we can construct the link using standard upload schemas.
          // Let's search if the landlord has verifications
        }
      } catch (err) {
        console.error('Error fetching verification documents:', err);
      }
    }
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setActiveModal(null);
    setModalPayments([]);
    setOwnershipDoc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Properties</h2>
          <p className="text-sm text-slate-500 mt-1">View, track, and manage all your registered units.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No properties registered yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            You don't have any properties claimed or registered. Use the "Add Property" tab on the side panel to claim flat ownership!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const isOccupied = property.status === 'occupied';
            const isPending = property.isApproved === 'pending';
            const tenantName = property.leaseId?.tenantId
              ? `${property.leaseId.tenantId.firstName} ${property.leaseId.tenantId.lastName}`
              : 'None';

            return (
              <div
                key={property._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${isOccupied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'} flex items-center justify-center`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-100 text-amber-800'
                          : isOccupied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isPending ? 'Pending Approval' : property.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">Flat {property.flatNo}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Residential Unit</p>

                  <div className="space-y-2 border-t border-slate-100 pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tenant Name:</span>
                      <span className="font-semibold text-slate-800">{tenantName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Monthly Rent:</span>
                      <span className="font-semibold text-slate-800">₹{Number(property.monthlyRent || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Security Deposit:</span>
                      <span className="font-semibold text-slate-800">₹{Number(property.securityDeposit || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openModal(property, 'details')}
                    className="inline-flex items-center justify-center px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 mr-1" />
                    Details
                  </button>
                  <button
                    onClick={() => openModal(property, 'documents')}
                    className="inline-flex items-center justify-center px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Docs
                  </button>
                  <button
                    onClick={() => openModal(property, 'history')}
                    className="inline-flex items-center justify-center px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 mr-1" />
                    History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {activeModal === 'details' && selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Property Details - Flat {selectedProperty.flatNo}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Approval Status</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{selectedProperty.isApproved}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Flat Status</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{selectedProperty.status}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lease Pricing</h4>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-xs text-slate-500">Monthly Rent:</span>
                    <p className="font-bold text-slate-800">₹{Number(selectedProperty.monthlyRent || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Security Deposit:</span>
                    <p className="font-bold text-slate-800">₹{Number(selectedProperty.securityDeposit || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedProperty.leaseId && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tenant Profile</h4>
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedProperty.leaseId.tenantId.firstName} {selectedProperty.leaseId.tenantId.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-800">{selectedProperty.leaseId.tenantId.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Phone Number:</span>
                      <span className="font-semibold text-slate-800">{selectedProperty.leaseId.tenantId.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Lease Period:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(selectedProperty.leaseId.startDate).toLocaleDateString()} - {new Date(selectedProperty.leaseId.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {activeModal === 'documents' && selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Property Documents - Flat {selectedProperty.flatNo}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Property Ownership Document</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Uploaded proof verifying flat ownership claim.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Verification Status:</span>
                    <span className="font-semibold capitalize text-slate-800">{selectedProperty.isApproved}</span>
                  </div>
                  
                  {selectedProperty.isApproved === 'approved' && (
                    <div className="flex items-center text-xs text-emerald-600 font-semibold gap-1">
                      <CheckCircle className="w-4 h-4" /> Ownership verified by administrator
                    </div>
                  )}

                  {selectedProperty.isApproved === 'pending' && (
                    <div className="flex items-center text-xs text-amber-600 font-semibold gap-1">
                      <AlertCircle className="w-4 h-4" /> Awaiting administrator review
                    </div>
                  )}
                </div>

                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-2">Digital File Attachment</p>
                  <span className="inline-flex text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-semibold">
                    Document is securely stored on server
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {activeModal === 'history' && selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Payment History - Flat {selectedProperty.flatNo}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {modalPayments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium">No payment history found for this property.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                        <th className="p-3">Payment ID</th>
                        <th className="p-3">Rent Month</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {modalPayments.map((payment) => (
                        <tr key={payment.paymentId} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-700">{payment.paymentId}</td>
                          <td className="p-3 text-slate-600">{payment.rentMonth || 'N/A'}</td>
                          <td className="p-3 font-bold text-slate-800">₹{payment.amount.toLocaleString()}</td>
                          <td className="p-3 text-slate-500">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                payment.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : payment.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProperties;