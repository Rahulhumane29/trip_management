import React, { useState, useEffect } from 'react';

export default function AddItineraryDay({ show, onClose, onSave, initialData, places, cities = [], countries = [], itineraryDays = [], maxDays }) {
  console.log("AddItineraryDay props:", { citiesCount: cities.length, countriesCount: countries.length, placesCount: places.length });
  const [tripDay, setTripDay] = useState(1);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [mealPlan, setMealPlan] = useState('');
  const [searchTerms, setSearchTerms] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const createDefaultItem = (seq) => ({
    id: Math.random().toString(36).substring(2, 9),
    item_type: 'Sightseeing',
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
      if (initialData) {
        const currentDayNum = initialData.trip_day || initialData.day || 1;
        setTripDay(currentDayNum);
        setNotes(initialData.notes || '');
        setMealPlan(initialData.meal_plan || '');
        
        if (initialData.items && initialData.items.length > 0) {
          setItems(initialData.items.map((item, idx) => {
            const mappedPlaces = item.places || (item.places_details ? item.places_details.map(p => p.id) : []) || (item.place ? [item.place] : []);
            return {
              ...item,
              id: item.id || Math.random().toString(36).substring(2, 9),
              sequence: item.sequence || idx + 1,
              places: mappedPlaces
            };
          }));
        } else if (initialData.place) {
          // Legacy prefill
          const legacyCity = initialData.city_id || (places.find(p => p.id === initialData.place)?.city || '');
          setItems([{
            id: Math.random().toString(36).substring(2, 9),
            item_type: 'Sightseeing',
            city: legacyCity,
            places: [initialData.place],
            start_time: '09:00',
            end_time: '18:00',
            sequence: 1,
            description: initialData.description || ''
          }]);
        } else {
          setItems([createDefaultItem(1)]);
        }
      } else {
        // Adding a completely new day (not in itineraryDays yet)
        const maxDay = itineraryDays.length > 0
          ? Math.max(...itineraryDays.map(d => parseInt(d.trip_day || d.day || 0)))
          : 0;
        const nextDayNum = maxDay + 1;
        setTripDay(nextDayNum);
        setNotes('');
        setMealPlan('');
        setItems([createDefaultItem(1)]);
      }
    }
  }, [show, initialData, itineraryDays]);

  const handleAddItem = () => {
    setItems([...items, createDefaultItem(items.length + 1)]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(items.map(item => {
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
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one itinerary item.");
      return;
    }

    if (maxDays && parseInt(tripDay) > maxDays) {
      alert(`You cannot add a day number (${tripDay}) greater than the trip duration (${maxDays} Days).`);
      return;
    }

    // Sort items by sequence
    const sortedItems = [...items].sort((a, b) => parseInt(a.sequence || 0) - parseInt(b.sequence || 0));

    onSave({
      trip_day: parseInt(tripDay),
      notes,
      meal_plan: mealPlan,
      items: sortedItems
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      
      {/* Modal Box */}
      <div className="w-full max-w-2xl bg-slate-50 border border-slate-200/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {initialData ? 'Edit Itinerary Day' : 'Add Itinerary Day'}
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
                className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Meals Select Toggles */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Included Meals
            </label>
            <div className="flex gap-2">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => {
                const isSelected = mealPlan.split(',').map(m => m.trim()).includes(meal);
                
                const handleToggleMeal = () => {
                  const selectedMeals = mealPlan.split(',').map(m => m.trim()).filter(Boolean);
                  let newMeals;
                  if (isSelected) {
                    newMeals = selectedMeals.filter(m => m !== meal);
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
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {meal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Itinerary Items */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 border-t border-b border-slate-200/50 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itinerary Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            {items.map((item, idx) => {
              const filteredPlaces = places.filter(p => 
                (!item.city || p.city == item.city) && 
                (!item.country || p.country == item.country)
              );
              const searchTerm = (searchTerms[item.id] || '').toLowerCase();
              const searchedPlaces = filteredPlaces.filter(p => (p.place_name || p.name || '').toLowerCase().includes(searchTerm));

              return (
                <div key={item.id} className="p-4 bg-white border border-slate-200/60 rounded-xl space-y-3 shadow-sm relative group">
                  {/* Item Header & Delete */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
                          {cities.map(c => (
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
                          {cities.map(c => (
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
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Country</label>
                        <select
                          value={item.country || ''}
                          onChange={(e) => handleItemChange(item.id, 'country', e.target.value)}
                          className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="">Select Country...</option>
                          {countries.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">City</label>
                        <select
                          value={item.city || ''}
                          onChange={(e) => handleItemChange(item.id, 'city', e.target.value)}
                          className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="">Select City...</option>
                          {cities.filter(c => !item.country || c.country == item.country).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Places / Attractions</label>
                        
                        {/* Dropdown Trigger */}
                        <div
                          onClick={() => setOpenDropdowns({ ...openDropdowns, [item.id]: !openDropdowns[item.id] })}
                          className="flex justify-between items-center w-full p-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer select-none"
                        >
                          <span className="truncate">
                            {item.places && item.places.length > 0
                              ? item.places.map(pid => places.find(p => p.id == pid)?.place_name || places.find(p => p.id == pid)?.name).filter(Boolean).join(', ')
                              : 'Select Places...'}
                          </span>
                          <svg className={`w-4 h-4 text-slate-400 transition-transform ${openDropdowns[item.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {/* Dropdown Content Overlay */}
                        {openDropdowns[item.id] && (
                          <>
                            {/* Click outside backdrop */}
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdowns({ ...openDropdowns, [item.id]: false })} />
                            
                            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1.5">
                              <input
                                type="text"
                                placeholder="Type to search places..."
                                value={searchTerms[item.id] || ''}
                                onChange={(e) => setSearchTerms({ ...searchTerms, [item.id]: e.target.value })}
                                className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                              />
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {searchedPlaces.length === 0 ? (
                                  <span className="text-[10px] text-slate-450 italic p-1 block">No places found</span>
                                ) : (
                                  searchedPlaces.map(p => {
                                    const isChecked = (item.places || []).some(pid => pid == p.id);
                                    const handleCheckboxChange = (e) => {
                                      const checked = e.target.checked;
                                      const currentPlaces = item.places || [];
                                      let nextPlaces;
                                      if (checked) {
                                        nextPlaces = [...currentPlaces, p.id];
                                      } else {
                                        nextPlaces = currentPlaces.filter(id => id != p.id);
                                      }
                                      handleItemChange(item.id, 'places', nextPlaces);
                                    };

                                    return (
                                      <label key={p.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100/50 p-1 rounded transition-all">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={handleCheckboxChange}
                                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                        />
                                        <span>{p.place_name || p.name}</span>
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description text area */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Description / Details</label>
                    <textarea
                      rows={1}
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Details of the activity or flight details..."
                      className="block w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none transition-all resize-y"
                    />
                  </div>
                </div>
              );
            })}
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H8" />
              </svg>
              <span>{initialData ? 'Update Day' : 'Add Day'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
