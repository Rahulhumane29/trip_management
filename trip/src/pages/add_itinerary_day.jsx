import React, { useState, useEffect, useRef } from 'react';

export default function AddItineraryDay({
  show,
  onClose,
  onSave,
  initialData,
  places = [],
  cities = [],
  countries = [],
  itineraryDays = [],
  maxDays
}) {
  const [tripDay, setTripDay] = useState(1);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [mealPlan, setMealPlan] = useState('');
  const [searchTerms, setSearchTerms] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [dropdownPos, setDropdownPos] = useState(null);

  const triggerRefs = useRef({});

  const createDefaultItem = (seq) => ({
    id: Math.random().toString(36).substring(2, 9),
    item_type: 'Activity',
    country: '',
    city: '',
    places: [],
    start_time: '',
    end_time: '',
    sequence: seq,
    description: '',
    from_city: '',
    to_city: '',
    departure_time: '',
    arrival_time: '',
    transport_mode: 'Bus',
    duration: ''
  });

  // Prefill details if editing
  useEffect(() => {
    if (show) {
      setOpenDropdowns({});
      setDropdownPos(null);

      if (initialData) {
        const currentDayNum = initialData.trip_day || initialData.day || 1;
        setTripDay(currentDayNum);
        setNotes(initialData.notes || '');
        setMealPlan(initialData.meal_plan || '');

        if (initialData.items && initialData.items.length > 0) {
          setItems(
            initialData.items.map((item, idx) => {
              const mappedPlaces =
                item.places ||
                (item.places_details ? item.places_details.map((p) => p.id) : []) ||
                (item.place ? [item.place] : []);

              // Auto resolve country if missing but city is set
              let resolvedCountry = item.country || '';
              if (!resolvedCountry && item.city) {
                const matchedCity = cities.find((c) => c.id == item.city || c.name == item.city);
                if (matchedCity) {
                  resolvedCountry = matchedCity.country?.id || matchedCity.country || '';
                }
              }

              return {
                ...item,
                country: resolvedCountry,
                id: item.id || Math.random().toString(36).substring(2, 9),
                sequence: item.sequence || idx + 1,
                places: mappedPlaces
              };
            })
          );
        } else if (initialData.place) {
          // Legacy prefill
          const legacyCity =
            initialData.city_id ||
            (places.find((p) => p.id === initialData.place)?.city || '');
          let legacyCountry = '';
          if (legacyCity) {
            const matchedCity = cities.find((c) => c.id == legacyCity || c.name == legacyCity);
            if (matchedCity) {
              legacyCountry = matchedCity.country?.id || matchedCity.country || '';
            }
          }

          setItems([
            {
              id: Math.random().toString(36).substring(2, 9),
              item_type: 'Activity',
              country: legacyCountry,
              city: legacyCity,
              places: [initialData.place],
              start_time: '09:00',
              end_time: '18:00',
              sequence: 1,
              description: initialData.description || ''
            }
          ]);
        } else {
          setItems([createDefaultItem(1)]);
        }
      } else {
        // Adding a completely new day (not in itineraryDays yet)
        const maxDay =
          itineraryDays.length > 0
            ? Math.max(...itineraryDays.map((d) => parseInt(d.trip_day || d.day || 0)))
            : 0;
        const nextDayNum = maxDay + 1;
        setTripDay(nextDayNum);
        setNotes('');
        setMealPlan('');
        setItems([createDefaultItem(1)]);
      }
    } else {
      setOpenDropdowns({});
      setDropdownPos(null);
    }
  }, [show, initialData, itineraryDays, cities, places]);

  // Reposition floating dropdown on scroll or resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (!dropdownPos?.itemId) return;
      const el = triggerRefs.current[dropdownPos.itemId];
      if (!el) {
        setOpenDropdowns({});
        setDropdownPos(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpenDropdowns({});
        setDropdownPos(null);
      } else {
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpwards = spaceBelow < 260 && rect.top > 260;
        const popoverWidth = Math.max(rect.width, 300);
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - popoverWidth - 16));
        setDropdownPos((prev) =>
          prev
            ? {
                ...prev,
                top: openUpwards ? undefined : rect.bottom + 4,
                bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
                left,
                width: popoverWidth
              }
            : null
        );
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [dropdownPos]);

  const handleAddItem = () => {
    setItems([...items, createDefaultItem(items.length + 1)]);
  };

  const handleRemoveItem = (itemId) => {
    if (openDropdowns[itemId]) {
      setOpenDropdowns({});
      setDropdownPos(null);
    }
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Cascading update: Country -> City -> Places
  const handleItemChange = (itemId, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          if (field === 'country') {
            updated.city = '';
            updated.places = [];
          } else if (field === 'city') {
            updated.places = [];
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Toggle Places popover
  const togglePlacesDropdown = (itemId) => {
    if (openDropdowns[itemId]) {
      setOpenDropdowns({});
      setDropdownPos(null);
      return;
    }

    const el = triggerRefs.current[itemId];
    if (el) {
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 260 && rect.top > 260;
      const popoverWidth = Math.max(rect.width, 300);
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - popoverWidth - 16));

      setDropdownPos({
        top: openUpwards ? undefined : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
        left,
        width: popoverWidth,
        itemId
      });
      setOpenDropdowns({ [itemId]: true });
    }
  };

  const getItemCountryObj = (item) => {
    return countries.find((c) => c.id == item.country || c.name == item.country);
  };

  const getCitiesForItem = (item) => {
    if (!item.country) return [];
    const countryObj = getItemCountryObj(item);
    const cId = countryObj?.id || item.country;
    const cName = countryObj?.name;
    return cities.filter((c) => {
      const cityCountryId = c.country?.id || c.country;
      const cityCountryName = c.country_name || c.country?.name;
      return (
        (cId && (cityCountryId == cId || cityCountryName == cId)) ||
        (cName && (cityCountryName == cName || cityCountryId == cName))
      );
    });
  };

  const getItemCityObj = (item) => {
    return cities.find((c) => c.id == item.city || c.name == item.city);
  };

  const getPlacesForItem = (item) => {
    if (!item.city) return [];
    const cityObj = getItemCityObj(item);
    const cityId = cityObj?.id || item.city;
    const cityName = cityObj?.name;
    return places.filter((p) => {
      const pCityId = p.city?.id || p.city || p.city_details?.id;
      const pCityName = p.city_name || p.city_details?.name;
      return (
        (cityId && (pCityId == cityId || pCityName == cityId)) ||
        (cityName && (pCityName == cityName || pCityId == cityName))
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one itinerary item.');
      return;
    }

    if (maxDays && parseInt(tripDay) > maxDays) {
      alert(`You cannot add a day number (${tripDay}) greater than the trip duration (${maxDays} Days).`);
      return;
    }

    // Validate that each activity item has Country and City selected
    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      if (itm.item_type !== 'Transport') {
        if (!itm.country) {
          alert(`Item #${i + 1}: Please select a Country.`);
          return;
        }
        if (!itm.city) {
          alert(`Item #${i + 1}: Please select a City.`);
          return;
        }
      }
    }

    // Sort items by sequence
    const sortedItems = [...items].sort(
      (a, b) => parseInt(a.sequence || 0) - parseInt(b.sequence || 0)
    );

    onSave({
      trip_day: parseInt(tripDay),
      notes,
      meal_plan: mealPlan,
      items: sortedItems
    });
  };

  if (!show) return null;

  // Currently open item for the places dropdown
  const activeItemId = Object.keys(openDropdowns).find((id) => openDropdowns[id]);
  const activeItem = activeItemId ? items.find((i) => i.id === activeItemId) : null;
  const activePlaces = activeItem ? getPlacesForItem(activeItem) : [];
  const activeCityObj = activeItem ? getItemCityObj(activeItem) : null;
  const activeSearchTerm = activeItemId ? (searchTerms[activeItemId] || '').toLowerCase().trim() : '';
  const activeFilteredPlaces = activePlaces.filter((p) =>
    (p.place_name || p.name || '').toLowerCase().includes(activeSearchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
      {/* Modal Box */}
      <div className="w-full max-w-3xl bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 relative my-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {initialData ? 'Edit Itinerary Day' : 'Add Itinerary Day'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure daily itinerary schedule, destinations, and activities
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-200/60 rounded-lg cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day Number */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Day Number *
              </label>
              <input
                type="number"
                required
                min={1}
                max={maxDays}
                value={tripDay}
                onChange={(e) => setTripDay(e.target.value)}
                className="block w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Day Notes / Summary
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Early checkout, wear walking shoes"
                className="block w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Meals Select Toggles */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Included Meals
            </label>
            <div className="flex gap-2">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                const isSelected = mealPlan.split(',').map((m) => m.trim()).includes(meal);

                const handleToggleMeal = () => {
                  const selectedMeals = mealPlan.split(',').map((m) => m.trim()).filter(Boolean);
                  let newMeals;
                  if (isSelected) {
                    newMeals = selectedMeals.filter((m) => m !== meal);
                  } else {
                    newMeals = [...selectedMeals, meal];
                  }
                  setMealPlan(newMeals.join(', '));
                };

                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={handleToggleMeal}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {meal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Itinerary Items */}
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 border-t border-b border-slate-200/70 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Itinerary Items
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select Country &rarr; City &rarr; Places sequentially for each activity
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              >
                + Add Item
              </button>
            </div>

            {items.map((item, idx) => {
              const availableCitiesForCountry = getCitiesForItem(item);
              const availablePlacesForCity = getPlacesForItem(item);

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-3.5 shadow-xs relative group hover:border-slate-300 transition-colors"
                >
                  {/* Item Header & Delete */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Destination & Location Inputs */}
                  {item.item_type === 'Transport' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">From City</label>
                        <select
                          value={item.from_city || ''}
                          onChange={(e) => handleItemChange(item.id, 'from_city', e.target.value)}
                          className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="">Select From City...</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">To City</label>
                        <select
                          value={item.to_city || ''}
                          onChange={(e) => handleItemChange(item.id, 'to_city', e.target.value)}
                          className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="">Select To City...</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Mode & Duration</label>
                        <div className="flex gap-2">
                          <select
                            value={item.transport_mode || 'Bus'}
                            onChange={(e) => handleItemChange(item.id, 'transport_mode', e.target.value)}
                            className="w-1/2 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                          >
                            <option value="Bus">Bus</option>
                            <option value="Train">Train</option>
                            <option value="Flight">Flight</option>
                            <option value="Taxi">Taxi</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Duration (e.g. 3h)"
                            value={item.duration || ''}
                            onChange={(e) => handleItemChange(item.id, 'duration', e.target.value)}
                            className="w-1/2 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Step 1: COUNTRY */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.country || ''}
                          onChange={(e) => handleItemChange(item.id, 'country', e.target.value)}
                          className="block w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="">Select Country...</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: CITY (Disabled until Country is selected) */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.city || ''}
                          onChange={(e) => handleItemChange(item.id, 'city', e.target.value)}
                          disabled={!item.country}
                          className={`block w-full p-2 text-xs rounded-lg font-semibold focus:outline-none transition-all ${
                            !item.country
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer'
                          }`}
                        >
                          <option value="">
                            {!item.country ? 'Select Country first...' : 'Select City...'}
                          </option>
                          {availableCitiesForCountry.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 3: PLACES / ATTRACTIONS (Disabled until City is selected) */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                          Places / Attractions
                        </label>

                        {/* Dropdown Trigger */}
                        <div
                          ref={(el) => (triggerRefs.current[item.id] = el)}
                          onClick={() => {
                            if (!item.country || !item.city) return;
                            togglePlacesDropdown(item.id);
                          }}
                          className={`flex justify-between items-center w-full p-2 text-xs rounded-lg font-semibold transition-all ${
                            !item.country || !item.city
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none'
                              : openDropdowns[item.id]
                              ? 'bg-white border-2 border-blue-500 text-slate-800 cursor-pointer shadow-sm select-none'
                              : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-400 cursor-pointer select-none'
                          }`}
                        >
                          <span className="truncate">
                            {!item.country ? (
                              <span className="text-slate-400 font-normal">Select Country first...</span>
                            ) : !item.city ? (
                              <span className="text-slate-400 font-normal">Select City first...</span>
                            ) : item.places && item.places.length > 0 ? (
                              <span className="flex items-center gap-1.5 overflow-hidden">
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                  {item.places.length}
                                </span>
                                <span className="truncate text-slate-800 font-semibold">
                                  {item.places
                                    .map(
                                      (pid) =>
                                        places.find((p) => p.id == pid)?.place_name ||
                                        places.find((p) => p.id == pid)?.name
                                    )
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">Select Places...</span>
                            )}
                          </span>
                          <svg
                            className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform ${
                              openDropdowns[item.id] ? 'rotate-180 text-blue-600' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description text area */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Description / Activity Details
                    </label>
                    <textarea
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Details of the activity, tour plan, timings, etc..."
                      className="block w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H8" />
              </svg>
              <span>{initialData ? 'Update Day' : 'Add Day'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FIXED FLOATING DROPDOWN OVERLAY (Never gets cut off by modal or cards) */}
      {activeItemId && activeItem && dropdownPos && (
        <>
          {/* Transparent click-outside backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setOpenDropdowns({});
              setDropdownPos(null);
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              bottom: dropdownPos.bottom,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl p-2.5 space-y-2 select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Search places in ${activeCityObj?.name || 'city'}...`}
                value={searchTerms[activeItemId] || ''}
                onChange={(e) => setSearchTerms({ ...searchTerms, [activeItemId]: e.target.value })}
                className="block w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                autoFocus
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Selection Status & Action buttons */}
            <div className="flex justify-between items-center px-1 text-[10px] font-bold text-slate-400">
              <span>{activeItem.places?.length || 0} selected</span>
              <div className="flex gap-2">
                {activeFilteredPlaces.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIds = activeItem.places || [];
                      const allVisibleIds = activeFilteredPlaces.map((p) => p.id);
                      const combined = Array.from(new Set([...currentIds, ...allVisibleIds]));
                      handleItemChange(activeItemId, 'places', combined);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                )}
                {activeItem.places && activeItem.places.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleItemChange(activeItemId, 'places', [])}
                    className="text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Places Checkbox List */}
            <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-slate-50 pr-0.5">
              {activePlaces.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  No places registered for {activeCityObj?.name || 'this city'}
                </div>
              ) : activeFilteredPlaces.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  No places match &ldquo;{searchTerms[activeItemId]}&rdquo;
                </div>
              ) : (
                activeFilteredPlaces.map((p) => {
                  const isChecked = (activeItem.places || []).some((pid) => pid == p.id);
                  const handleCheckboxChange = (e) => {
                    const checked = e.target.checked;
                    const currentPlaces = activeItem.places || [];
                    let nextPlaces;
                    if (checked) {
                      nextPlaces = [...currentPlaces, p.id];
                    } else {
                      nextPlaces = currentPlaces.filter((id) => id != p.id);
                    }
                    handleItemChange(activeItemId, 'places', nextPlaces);
                  };

                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2.5 text-xs font-semibold p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 text-blue-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{p.place_name || p.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
