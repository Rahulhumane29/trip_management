import React, { useState, useEffect } from 'react';
import AddHotel from '../pages/add_hotel';

export default function Hotel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Country');
  const [selectedCity, setSelectedCity] = useState('City');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [countries, setCountries] = useState(['Country']);
  const [cities, setCities] = useState(['City']);

  const loadData = () => {
    fetch('/api/hotels/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            address: item.address,
            description: item.description || '',
            phone_number: item.phone_number || '',
            email: item.email || '',
            website: item.website || '',
            star_rating: item.star_rating || 3,
            city: item.city_details?.name || 'Unknown',
            state: item.state_details?.name || 'Unknown',
            country: item.country_details?.name || 'Unknown',
            status: item.is_active ? 'Active' : 'Inactive',
            color: 'bg-teal-50 text-teal-600'
          }));
          setHotels(formatted);
        }
      })
      .catch(err => console.error("Error loading hotels:", err));

    fetch('/api/places/countries/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCountries(['Country', ...data.map(c => c.name)]);
        }
      });

    fetch('/api/places/cities/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(['City', ...data.map(c => c.name)]);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleDelete = (id) => {
    const token = localStorage.getItem('access_token');
    fetch(`/api/hotels/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        setHotels(hotels.filter(h => h.id !== id));
      }
    })
    .catch(err => console.error("Error deleting hotel:", err));
  };

  const handleSaveHotel = (newHotel) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Authorization token missing. Please login again.");
      return Promise.reject("No token");
    }

    const url = editingHotel ? `/api/hotels/${editingHotel.id}/` : '/api/hotels/';
    const method = editingHotel ? 'PUT' : 'POST';

    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: newHotel.name,
        address: newHotel.address,
        description: newHotel.description,
        phone_number: newHotel.phone_number,
        email: newHotel.email,
        website: newHotel.website,
        star_rating: newHotel.star_rating,
        is_active: newHotel.is_active,
        country_name: newHotel.country,
        state_name: newHotel.state,
        city_name: newHotel.city
      })
    })
    .then(async res => {
      if (res.ok) {
        loadData();
        setShowAddModal(false);
        setEditingHotel(null);
        return true;
      } else {
        const err = await res.json();
        alert(err.detail || JSON.stringify(err) || "Failed to save hotel");
        throw err;
      }
    })
    .catch(err => {
      console.error("Error saving hotel:", err);
      throw err;
    });
  };

  // Filter logic
  const getFilteredHotels = () => {
    return hotels.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'Country' || h.country === selectedCountry;
      const matchesCity = selectedCity === 'City' || h.city === selectedCity;
      const matchesStatus = selectedStatus === 'Status' || h.status === selectedStatus;
      return matchesSearch && matchesCountry && matchesCity && matchesStatus;
    });
  };

  const currentList = getFilteredHotels();
  const activeCount = hotels.filter(h => h.status === 'Active').length;
  const inactiveCount = hotels.filter(h => h.status === 'Inactive').length;

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto font-sans">
      
      {/* Title Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Hotels
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">
            Manage hotels and accommodation partners across various regions.
          </p>
        </div>

        {/* Add Hotel button */}
        <button
          onClick={() => {
            setEditingHotel(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-[#0070f3] hover:bg-[#0060d0] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Hotel</span>
        </button>
      </div>

      {/* Summary KPI metrics row of 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Total Hotels */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Hotels</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{hotels.length}</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{activeCount}</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Inactive</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{inactiveCount}</span>
          </div>
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-100/60 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Header Filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-tight">
            Inventory List
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-60 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-[15px] w-[15px] text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotel name..."
                className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-100/50 border border-slate-200/20 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/20 focus:ring-[3px] focus:ring-blue-500/5 transition-all font-medium"
              />
            </div>

            {/* Country Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none block w-28 pl-3.5 pr-8 py-2 text-[12px] bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold focus:outline-none focus:border-blue-500/30 transition-all cursor-pointer"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* City Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none block w-24 pl-3.5 pr-8 py-2 text-[12px] bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold focus:outline-none focus:border-blue-500/30 transition-all cursor-pointer"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Status Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none block w-24 pl-3.5 pr-8 py-2 text-[12px] bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold focus:outline-none focus:border-blue-500/30 transition-all cursor-pointer"
              >
                <option value="Status">Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCountry !== 'Country' || selectedCity !== 'City' || selectedStatus !== 'Status') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountry('Country');
                  setSelectedCity('City');
                  setSelectedStatus('Status');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold transition-all cursor-pointer"
                title="Reset all filters"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Hotels Table layout */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {currentList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Hotel
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      City
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Country
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Rating
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Status
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {currentList.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Hotel name & thumb */}
                      <td className="py-4.5 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-teal-50 text-teal-600 border border-slate-200/50 rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-800 tracking-tight leading-tight">
                              {hotel.name}
                            </span>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase mt-1 leading-none">
                              {hotel.address}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* City details */}
                      <td className="py-4.5 px-6 align-middle text-slate-500 font-semibold text-xs">
                        {hotel.city}
                      </td>

                      {/* Country details */}
                      <td className="py-4.5 px-6 align-middle text-slate-500 font-semibold text-xs">
                        {hotel.country}
                      </td>

                      {/* Rating details */}
                      <td className="py-4.5 px-6 align-middle text-slate-800 font-bold text-xs">
                        <div className="flex items-center gap-1">
                          <span>{hotel.star_rating}.0</span>
                          <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </td>

                      {/* Status badges */}
                      <td className="py-4.5 px-6 align-middle">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          hotel.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {hotel.status}
                        </span>
                      </td>

                      {/* Actions cell */}
                      <td className="py-4.5 px-6 align-middle text-right text-slate-400">
                        <div className="flex items-center justify-end gap-3.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            title="Delete"
                            className="hover:text-red-500 cursor-pointer p-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingHotel(hotel);
                              setShowAddModal(true);
                            }}
                            title="Edit" 
                            className="hover:text-blue-600 cursor-pointer p-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white text-slate-400 text-xs font-medium">
              No hotels found matching selected filter criteria.
            </div>
          )}
        </div>

        {/* Table Pagination Footer */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {currentList.length} entries
          </span>

          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Add/Edit Hotel Modal */}
      <AddHotel 
        show={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setEditingHotel(null);
        }} 
        onSave={handleSaveHotel} 
        initialData={editingHotel}
      />

    </div>
  );
}
