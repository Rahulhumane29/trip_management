import React, { useState, useEffect } from 'react';

// Reusable Searchable Dropdown with Inline Addition
function SearchableSelect({ label, value, onChange, options, onAdd, icon, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt => {
    const name = typeof opt === 'string' ? opt : opt.name;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative space-y-1.5 font-sans">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setSearch('');
            setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false);
            }, 250);
          }}
          className="block w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-slate-200/80 rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1 py-1 divide-y divide-slate-50">
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const name = typeof opt === 'string' ? opt : opt.name;
              return (
                <button
                  key={name}
                  type="button"
                  onMouseDown={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  {name}
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
              No results found
            </div>
          )}

          {search.trim() && !options.some(o => (typeof o === 'string' ? o : o.name).toLowerCase() === search.trim().toLowerCase()) && (
            <button
              type="button"
              onMouseDown={() => {
                onAdd(search.trim());
                setIsOpen(false);
              }}
              className="block w-full text-left px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-600 transition-colors cursor-pointer"
            >
              + Add "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddHotel({ show, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [starRating, setStarRating] = useState(3);
  const [isActive, setIsActive] = useState(true);

  // Full datasets loaded from database
  const [rawCountries, setRawCountries] = useState([]);
  const [rawStates, setRawStates] = useState([]);
  const [rawCities, setRawCities] = useState([]);

  // Selected names
  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');

  // Load all lists from database on load
  const loadLists = () => {
    fetch('/api/places/countries/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRawCountries(data);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/places/states/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRawStates(data);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/places/cities/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRawCities(data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadLists();
  }, []);

  // Pre-fill fields if editing
  useEffect(() => {
    if (show) {
      if (initialData) {
        setName(initialData.name || '');
        setAddress(initialData.address || '');
        setDescription(initialData.description || '');
        setPhoneNumber(initialData.phone_number || '');
        setEmail(initialData.email || '');
        setWebsite(initialData.website || '');
        setStarRating(initialData.star_rating || 3);
        setIsActive(initialData.status === 'Active');
        setCountry(initialData.country || '');
        setStateName(initialData.state || '');
        setCity(initialData.city || '');
      } else {
        setName('');
        setAddress('');
        setDescription('');
        setPhoneNumber('');
        setEmail('');
        setWebsite('');
        setStarRating(3);
        setIsActive(true);
        setCountry('');
        setStateName('');
        setCity('');
      }
    }
  }, [show, initialData]);

  // Filter lists based on selections (cascade down)
  const getFilteredCountries = () => {
    return rawCountries.map(c => c.name);
  };

  const getFilteredStates = () => {
    if (!country) {
      return rawStates.map(s => s.name);
    }
    return rawStates
      .filter(s => s.country_name?.toLowerCase() === country.toLowerCase())
      .map(s => s.name);
  };

  const getFilteredCities = () => {
    let list = rawCities;
    if (country) {
      list = list.filter(c => c.country_name?.toLowerCase() === country.toLowerCase());
    }
    if (stateName) {
      list = list.filter(c => c.state_name?.toLowerCase() === stateName.toLowerCase());
    }
    return list.map(c => c.name);
  };

  // Reverse resolution handlers (cascade up)
  const handleCountryChange = (val) => {
    const nameVal = typeof val === 'string' ? val : val.name;
    setCountry(nameVal);
    setStateName('');
    setCity('');
  };

  const handleStateChange = (val) => {
    const nameVal = typeof val === 'string' ? val : val.name;
    setStateName(nameVal);

    const stateObj = rawStates.find(s => s.name.toLowerCase() === nameVal.toLowerCase());
    if (stateObj && stateObj.country_name) {
      setCountry(stateObj.country_name);
    }
    setCity('');
  };

  const handleCityChange = (val) => {
    const nameVal = typeof val === 'string' ? val : val.name;
    setCity(nameVal);

    const cityObj = rawCities.find(c => c.name.toLowerCase() === nameVal.toLowerCase());
    if (cityObj) {
      if (cityObj.state_name) {
        setStateName(cityObj.state_name);
      }
      if (cityObj.country_name) {
        setCountry(cityObj.country_name);
      }
    }
  };

  // Handlers to dynamically post new values immediately to DB
  const handleAddNewCountry = (newVal) => {
    fetch('/api/places/countries/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newVal })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.name) {
        setRawCountries(prev => [...prev, data]);
        setCountry(data.name);
      }
    })
    .catch(err => console.error(err));
  };

  const handleAddNewState = (newVal) => {
    fetch('/api/places/states/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newVal, country_name: country })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.name) {
        setRawStates(prev => [...prev, data]);
        setStateName(data.name);
      }
    })
    .catch(err => console.error(err));
  };

  const handleAddNewCity = (newVal) => {
    fetch('/api/places/cities/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newVal, country_name: country, state_name: stateName })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.name) {
        setRawCities(prev => [...prev, data]);
        setCity(data.name);
      }
    })
    .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await onSave({
        name,
        address,
        description,
        phone_number: phoneNumber,
        email,
        website,
        star_rating: parseInt(starRating),
        is_active: isActive,
        country,
        state: stateName,
        city
      });

      // Reset
      setName('');
      setAddress('');
      setDescription('');
      setPhoneNumber('');
      setEmail('');
      setWebsite('');
      setStarRating(3);
      setIsActive(true);
      setCountry('');
      setStateName('');
      setCity('');
    } catch (err) {
      console.error("Save failed, keeping inputs:", err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      
      {/* Full-width container box */}
      <div className="w-full max-w-4xl bg-slate-50 border border-slate-200/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {initialData ? 'Edit Hotel' : 'Add New Hotel'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Details Form */}
            <div className="lg:col-span-2 bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Hotel Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hotel Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Hotel Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter the hotel name"
                        className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Star Rating
                      </label>
                      <div className="relative">
                        <select
                          value={starRating}
                          onChange={(e) => setStarRating(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                        >
                          <option value="1">1 Star</option>
                          <option value="2">2 Star</option>
                          <option value="3">3 Star</option>
                          <option value="4">4 Star</option>
                          <option value="5">5 Star</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Beach Rd"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                    />
                  </div>

                  {/* Searchable Select Dropdown Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SearchableSelect
                      label="Country"
                      value={country}
                      onChange={handleCountryChange}
                      options={getFilteredCountries()}
                      onAdd={handleAddNewCountry}
                      placeholder="Search country..."
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      }
                    />

                    <SearchableSelect
                      label="State"
                      value={stateName}
                      onChange={handleStateChange}
                      options={getFilteredStates()}
                      onAdd={handleAddNewState}
                      placeholder="Search state..."
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      }
                    />

                    <SearchableSelect
                      label="City"
                      value={city}
                      onChange={handleCityChange}
                      options={getFilteredCities()}
                      onAdd={handleAddNewCity}
                      placeholder="Search city..."
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                    />
                  </div>

                  {/* Status Selection Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <select
                          value={isActive ? 'Active' : 'Inactive'}
                          onChange={(e) => setIsActive(e.target.value === 'Active')}
                          className="appearance-none block w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</h3>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={description}
                    maxLength={1000}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the hotel facilities, highlights, etc..."
                    className="block w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all h-28 resize-none leading-relaxed"
                  />
                </div>
              </div>

            </div>

            {/* Right Card: Contact Details */}
            <div className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="w-4.5 h-4.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact & Socials</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. bookings@hotel.com"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://www.hotel.com"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-teal-500/10 hover:shadow-teal-500/20"
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{initialData ? 'Update Details' : 'Save Hotel'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
