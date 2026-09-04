import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';

export default function TripInventory({ setActiveTab, setEditTripId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchTrips = () => {
    setLoading(true);
    fetch('/api/itinerary/inventory/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch trips');
        return res.json();
      })
      .then(data => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleEdit = (id) => {
    if (setEditTripId) setEditTripId(id);
    if (setActiveTab) setActiveTab('TripManage');
  };

  const confirmDelete = (trip) => {
    setTripToDelete(trip);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!tripToDelete) return;
    const token = localStorage.getItem('access_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    fetch(`/api/itinerary/${tripToDelete.id}/`, { 
      method: 'DELETE',
      headers
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete trip');
        setToast({ message: 'Trip deleted successfully', type: 'success' });
        setTimeout(() => setToast(null), 3000);
        setShowDeleteModal(false);
        setTripToDelete(null);
        fetchTrips();
      })
      .catch(err => {
        setToast({ message: err.message, type: 'error' });
        setTimeout(() => setToast(null), 3000);
        setShowDeleteModal(false);
        setTripToDelete(null);
      });
  };

  const handlePDF = (id) => {
    window.open(`/api/itinerary/${id}/pdf/`, '_blank');
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.trip_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.contact_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.cities && trip.cities.join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
      {toast && <Toast show={true} message={toast.message} type={toast.type} />}
      
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Trip Inventory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage all your trips</p>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('TripManage')}
          className="px-4 py-2 bg-[#ff6a00] hover:bg-[#e65c00] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Trip
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 flex gap-4 bg-white">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by ID, Name, Title, City..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4">Trip ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Trip Title</th>
              <th className="p-4">Dates (Dur)</th>
              <th className="p-4 max-w-[200px]">Cities</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="9" className="p-8 text-center text-slate-500">Loading trips...</td></tr>
            ) : error ? (
              <tr><td colSpan="9" className="p-8 text-center text-red-500">{error}</td></tr>
            ) : filteredTrips.length === 0 ? (
              <tr><td colSpan="9" className="p-8 text-center text-slate-500">No trips found</td></tr>
            ) : (
              filteredTrips.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-xs font-mono text-slate-500">{trip.id.substring(0,8)}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{trip.customer_name}</div>
                    <div className="text-xs text-slate-500">{trip.contact_number}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{trip.trip_title}</td>
                  <td className="p-4 text-xs">
                    <div>{trip.start_date} to {trip.end_date}</div>
                    <div className="text-slate-500">{trip.duration} days</div>
                  </td>
                  <td className="p-4 max-w-[200px] truncate text-xs">
                    {trip.cities?.length > 2 
                      ? `${trip.cities.slice(0, 2).join(' → ')} + ${trip.cities.length - 2} more`
                      : trip.cities?.join(' → ')}
                  </td>
                  <td className="p-4 text-right font-medium text-slate-700">
                    ₹{Number(trip.total_amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
                      {trip.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(trip.id)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View / Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handlePDF(trip.id)} className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors" title="PDF">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button onClick={() => confirmDelete(trip)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this trip for <b>{tripToDelete?.customer_name}</b>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
