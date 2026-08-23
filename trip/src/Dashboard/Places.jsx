import React, { useState, useEffect } from 'react';
import AddPlace from '../pages/add_place';

export default function Places() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Country');
  const [selectedCity, setSelectedCity] = useState('City');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [countries, setCountries] = useState(['Country']);
  const [cities, setCities] = useState(['City']);

  const loadData = () => {
    fetch('/api/places/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => ({
            id: item.id,
            name: item.place_name,
            category: item.city_details?.state_name ? "HISTORICAL SITE" : "BEACH",
            city: item.city_details?.name || 'Unknown',
            state: item.state_details?.name || 'Unknown',
            country: item.country_details?.name || 'Unknown',
            description: item.description || '',
            photo: item.photo || null,
            status: item.status || 'Active',
            color: 'bg-emerald-50 text-emerald-600'
          }));
          setPlaces(formatted);
        }
      })
      .catch(err => console.error("Error loading places:", err));

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
    fetch(`/api/places/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        setPlaces(places.filter(p => p.id !== id));
      }
    })
    .catch(err => console.error("Error deleting place:", err));
  };

  const handleSavePlace = (newPlace) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Authorization token missing. Please login again.");
      return Promise.reject("No token");
    }

    const url = editingPlace ? `/api/places/${editingPlace.id}/` : '/api/places/';
    const method = editingPlace ? 'PUT' : 'POST';

    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        place_name: newPlace.title,
        country_name: newPlace.country,
        state_name: newPlace.state,
        city_name: newPlace.city,
        description: newPlace.description,
        status: newPlace.status || 'Active'
      })
    })
    .then(async res => {
      if (res.ok) {
        loadData();
        setShowAddModal(false);
        setEditingPlace(null);
        return true;
      } else {
        const err = await res.json();
        alert(err.detail || JSON.stringify(err) || "Failed to save place");
        throw err;
      }
    })
    .catch(err => {
      console.error("Error saving place:", err);
      throw err;
    });
  };

  // Filter logic
  const getFilteredPlaces = () => {
    return places.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'Country' || p.country === selectedCountry;
      const matchesCity = selectedCity === 'City' || p.city === selectedCity;
      const matchesStatus = selectedStatus === 'Status' || p.status === selectedStatus;
      return matchesSearch && matchesCountry && matchesCity && matchesStatus;
    });
  };

  const currentList = getFilteredPlaces();

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto font-sans">
      
      {/* Page Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Places
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">
            Manage destinations, cities and travel attractions.
          </p>
        </div>

        {/* Add Place button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-[#0070f3] hover:bg-[#0060d0] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Place</span>
        </button>
      </div>

      {/* Summary KPI row of 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Total Places */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Places</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{places.length}</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Countries */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Countries</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{Math.max(0, countries.length - 1)}</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
        </div>

        {/* Card 3: Cities */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cities</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{Math.max(0, cities.length - 1)}</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

      </div>

      {/* Inventory List Card Container */}
      <div className="bg-white border border-slate-100/60 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Inventory Header Filter Row */}
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
                placeholder="Search place name..."
                className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-100/50 border border-slate-200/20 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/20 focus:ring-[3px] focus:ring-blue-500/5 transition-all font-medium"
              />
            </div>

            {/* Country Selector */}
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

            {/* City Selector */}
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

            {/* Status Selector */}
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

        {/* Places Table Layout */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {currentList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Place
                    </th>
                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      City
                    </th>
                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Country
                    </th>
                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Status
                    </th>
                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right w-24">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {currentList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                      
                      {/* Place details with image */}
                      <td className="py-4.5 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          {/* Stylized placeholder thumbnail image */}
                          <div className={`w-11 h-11 ${item.color.split(' ')[0]} rounded-xl flex items-center justify-center border border-slate-200/50 shrink-0`}>
                            <svg className="w-5 h-5 text-slate-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-800 tracking-tight leading-tight">
                              {item.name}
                            </span>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase mt-1 leading-none">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4.5 px-6 align-middle text-slate-500 font-semibold text-xs">
                        {item.city}
                      </td>

                      {/* Country */}
                      <td className="py-4.5 px-6 align-middle text-slate-500 font-semibold text-xs">
                        {item.country}
                      </td>

                      {/* Status Badges */}
                      <td className="py-4.5 px-6 align-middle">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Action Option Trigger */}
                      <td className="py-4.5 px-6 align-middle text-right text-slate-400">
                        <div className="flex items-center justify-end gap-3.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="hover:text-red-500 cursor-pointer p-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingPlace(item);
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
            <div className="text-center py-12 text-slate-400 text-xs bg-white">
              No places found matching selected filter criteria.
            </div>
          )}
        </div>

        {/* Table Pagination Footer */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {currentList.length} of 248 entries
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

      {/* Add Place Modal */}
      <AddPlace 
        show={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setEditingPlace(null);
        }} 
        onSave={handleSavePlace} 
        initialData={editingPlace}
      />

    </div>
  );
}
