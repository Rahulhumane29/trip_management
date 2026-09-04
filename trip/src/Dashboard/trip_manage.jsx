import React, { useState, useEffect } from 'react';
import AddItineraryDay from '../pages/add_itinerary_day';

// Multi Searchable Select Component for Inclusions, Exclusions, Policies
function MultiSearchableSelect({ label, placeholder, options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt =>
    opt.text.toLowerCase().includes(search.toLowerCase()) && !selectedValues.includes(opt.id)
  );

  return (
    <div className="relative space-y-1.5 font-sans">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      
      {/* Container wrapper for pills and input */}
      <div 
        className="min-h-[38px] p-1.5 flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.map(valId => {
          const opt = options.find(o => o.id === valId);
          if (!opt) return null;
          return (
            <span 
              key={valId} 
              className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold"
            >
              <span>{opt.text}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selectedValues.filter(id => id !== valId));
                }}
                className="hover:text-red-500 font-bold ml-1 text-[13px]"
              >
                &times;
              </button>
            </span>
          );
        })}
        
        <input
          type="text"
          placeholder={selectedValues.length === 0 ? placeholder : ''}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[80px] text-xs font-semibold text-slate-700 focus:outline-none bg-transparent"
        />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full bg-white border border-slate-200/80 rounded-xl shadow-xl max-h-40 overflow-y-auto mt-1 py-1 divide-y divide-slate-50">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={() => {
                    onChange([...selectedValues, opt.id]);
                    setSearch('');
                  }}
                  className="block w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  {opt.text}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-2 text-xs text-slate-400 font-medium">
                No results found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function TripManage({ tripId, setActiveTab, setEditTripId }) {
  const [step, setStep] = useState(1);

  // Lists loaded from backend
  const [availableHotels, setAvailableHotels] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [inclusionsList, setInclusionsList] = useState([]);
  const [exclusionsList, setExclusionsList] = useState([]);
  const [policiesList, setPoliciesList] = useState([]);
  const [importantNotesList, setImportantNotesList] = useState([]);

  // Step 1: Form state
  const [customerName, setCustomerName] = useState('');
  const [contactName, setContactName] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selected IDs
  const [selectedHotel, setSelectedHotel] = useState('Select Hotel');
  const [selectedInclusions, setSelectedInclusions] = useState([]);
  const [selectedExclusions, setSelectedExclusions] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedImportantNotes, setSelectedImportantNotes] = useState([]);

  // Day Modal State
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

  // Step 2: Itinerary items state - Initialized completely empty
  const [itineraryDays, setItineraryDays] = useState([]);

  const getDaysDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return itineraryDays.length || 0;
  };



  // Step 3: Pricing group occupancy state
  const [groups, setGroups] = useState([]);
  const [newGroupSize, setNewGroupSize] = useState('');
  const [pricingOptions, setPricingOptions] = useState([]);

  // Fetch backend lists for dynamic inputs
  const [loadingTrip, setLoadingTrip] = useState(false);

  // If we receive a tripId, this component is opened in Edit mode
  useEffect(() => {
    if (tripId) {
      setLoadingTrip(true);
      fetch(`/api/itinerary/${tripId}/`)
        .then(res => res.json())
        .then(data => {
          // Pre-populate fields based on the fetched complete itinerary data
          setCustomerName(data.customer_name || '');
          setContactName(data.contact_name || '');
          setTripTitle(data.event_title || '');
          setStartDate(data.trip_start_date || '');
          setEndDate(data.trip_end_date || '');
          
          if (data.inclusions_details) {
            setSelectedInclusions(data.inclusions_details.map(item => item.id));
          }
          if (data.exclusions_details) {
            setSelectedExclusions(data.exclusions_details.map(item => item.id));
          }
          if (data.policies_details) {
            setSelectedPolicies(data.policies_details.map(item => item.id));
          }
          if (data.important_notes_details) {
            setSelectedImportantNotes(data.important_notes_details.map(item => item.id));
          }
          if (data.days) {
            const mappedDays = data.days.map(d => {
              const mealsObj = {
                breakfast: (d.meal_plan || '').includes('Breakfast'),
                lunch: (d.meal_plan || '').includes('Lunch'),
                snacks: (d.meal_plan || '').includes('Snacks'),
                dinner: (d.meal_plan || '').includes('Dinner')
              };
              
              let resolvedActivities = [];
              if (d.items) {
                d.items.forEach(item => {
                  if (item.places_details && item.places_details.length > 0) {
                    item.places_details.forEach(p => resolvedActivities.push(p.place_name || p.name));
                  }
                });
              }

              return {
                day: String(d.trip_day).padStart(2, '0'),
                date: d.trip_date ? new Date(d.trip_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
                city: d.city_details ? d.city_details.name : 'Unknown',
                place: d.place || '',
                activities: resolvedActivities,
                meals: mealsObj,
                description: d.description || '',
                notes: d.notes || '',
                meal_plan: d.meal_plan || '',
                trip_day: d.trip_day,
                items: d.items || []
              };
            });
            setItineraryDays(mappedDays);
          }

          if (data.group_prices && data.group_prices.length > 0) {
            const uniqueGroups = [...new Set(data.group_prices.map(gp => gp.group_size))];
            setGroups(uniqueGroups);

            const optionsMap = {};
            data.group_prices.forEach(gp => {
              const hotelName = gp.hotel_details ? gp.hotel_details.name : 'Unknown Hotel';
              const mealPlan = gp.meals_included || 'Breakfast';
              const travelType = gp.travel_type || 'Private Coach';
              
              const key = `${hotelName}-${mealPlan}-${travelType}`;
              if (!optionsMap[key]) {
                optionsMap[key] = {
                  id: Date.now().toString() + Math.random(),
                  hotelName: hotelName,
                  mealPlan: mealPlan,
                  travelType: travelType,
                  groupPrices: {}
                };
              }
              optionsMap[key].groupPrices[gp.group_size] = {
                hotelPrice: Number(gp.hotel_price),
                mealPrice: Number(gp.meal_price),
                travelPrice: Number(gp.travel_price),
                otherPrice: Number(gp.other_charges)
              };
            });
            setPricingOptions(Object.values(optionsMap));
          }

          setLoadingTrip(false);
        })
        .catch(err => {
          console.error("Error loading trip for edit:", err);
          setLoadingTrip(false);
        });
    }
  }, [tripId]);

  useEffect(() => {
    fetch('/api/hotels/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableHotels(data);
      })
      .catch(err => console.error(err));

    fetch('/api/places/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailablePlaces(data);
      })
      .catch(err => console.error(err));

    fetch('/api/places/cities/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableCities(data);
      })
      .catch(err => console.error(err));

    fetch('/api/places/countries/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableCountries(data);
      })
      .catch(err => console.error(err));

    fetch('/api/conditions/inclusions/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInclusionsList(data.map(item => ({ id: item.id, text: item.text.split(' | ')[0] })));
      })
      .catch(err => console.error(err));

    fetch('/api/conditions/exclusions/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExclusionsList(data.map(item => ({ id: item.id, text: item.text.split(' | ')[0] })));
      })
      .catch(err => console.error(err));

    fetch('/api/conditions/policies/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPoliciesList(data.map(item => ({ id: item.id, text: item.text.split(' | ')[0] })));
      })
      .catch(err => console.error(err));

    fetch('/api/conditions/important_notes/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setImportantNotesList(data.map(item => ({ id: item.id, text: item.text.split(' | ')[0] })));
      })
      .catch(err => console.error(err));
  }, []);

  // Navigation callbacks
  const handleNext = () => {
    if (step === 1) {
      if (!customerName || !customerName.trim()) {
        alert("Please enter Customer Name.");
        return;
      }
      if (customerName.trim().length < 3) {
        alert("Customer Name must be at least 3 characters long.");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(customerName.trim())) {
        alert("Customer Name must contain only letters and spaces.");
        return;
      }

      if (!contactName || !contactName.trim()) {
        alert("Please enter Contact Name.");
        return;
      }
      if (contactName.trim().length < 3) {
        alert("Contact Name must be at least 3 characters long.");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(contactName.trim())) {
        alert("Contact Name must contain only letters and spaces.");
        return;
      }

      if (!tripTitle || !tripTitle.trim()) {
        alert("Please enter Trip Title.");
        return;
      }
      if (tripTitle.trim().length < 5) {
        alert("Trip Title must be at least 5 characters long.");
        return;
      }

      if (!startDate) {
        alert("Please select a Trip Start Date.");
        return;
      }
      if (!endDate) {
        alert("Please select a Trip End Date.");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert("Trip Start Date must be before or equal to Trip End Date.");
        return;
      }
    } else if (step === 2) {
      if (itineraryDays.length === 0) {
        alert("Please add at least one Itinerary Day.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  // Save Day Callback
  const handleSaveDay = (dayData) => {
    // Resolve cities from items
    const cityIds = dayData.items ? dayData.items.map(item => item.city).filter(Boolean) : [];
    const resolvedCities = Array.from(new Set(cityIds.map(cid => {
      const cityObj = availableCities.find(c => c.id === cid || c.name === cid);
      return cityObj ? cityObj.name : cid;
    })));
    const resolvedCity = resolvedCities.length > 0 ? resolvedCities.join(', ') : 'Unknown';

    // Resolve places/activities from items
    let resolvedActivities = [];
    if (dayData.items) {
      dayData.items.forEach(item => {
        if (item.places && item.places.length > 0) {
          item.places.forEach(pid => {
            const placeObj = availablePlaces.find(p => p.id === pid);
            if (placeObj) {
              resolvedActivities.push(placeObj.place_name || placeObj.name);
            }
          });
        }
      });
    }

    const mealsObj = {
      breakfast: dayData.meal_plan.includes('Breakfast'),
      lunch: dayData.meal_plan.includes('Lunch'),
      snacks: dayData.meal_plan.includes('Snacks'),
      dinner: dayData.meal_plan.includes('Dinner')
    };

    const formattedDay = {
      day: String(dayData.trip_day).padStart(2, '0'),
      date: startDate ? new Date(new Date(startDate).getTime() + (dayData.trip_day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : '',
      city: resolvedCity,
      place: dayData.items?.[0]?.places?.[0] || '', // Fallback first place
      activities: resolvedActivities,
      meals: mealsObj,
      description: dayData.description,
      notes: dayData.notes,
      meal_plan: dayData.meal_plan,
      trip_day: dayData.trip_day,
      items: dayData.items || []
    };

    if (editingDayIndex !== null) {
      const updated = [...itineraryDays];
      updated[editingDayIndex] = formattedDay;
      updated.sort((a, b) => parseInt(a.day) - parseInt(b.day));
      setItineraryDays(updated);
    } else {
      const updated = [...itineraryDays, formattedDay];
      updated.sort((a, b) => parseInt(a.day) - parseInt(b.day));
      setItineraryDays(updated);
    }

    setShowDayModal(false);
    setEditingDayIndex(null);
  };

  const handleDeleteDay = (idx) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== idx));
  };

  // Group size additions/removals
  const addGroupSize = () => {
    const size = parseInt(newGroupSize);
    if (!size || groups.includes(size)) return;
    const updatedGroups = [...groups, size].sort((a, b) => a - b);
    setGroups(updatedGroups);
    setNewGroupSize('');

    // Pre-populate pricing options with 0s for this new group size
    setPricingOptions(pricingOptions.map(opt => {
      const currentGroupPrices = { ...opt.groupPrices };
      if (!currentGroupPrices[size]) {
        currentGroupPrices[size] = { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
      }
      return { ...opt, groupPrices: currentGroupPrices };
    }));
  };

  const removeGroupSize = (size) => {
    setGroups(groups.filter(g => g !== size));
    setPricingOptions(pricingOptions.map(opt => {
      const updated = { ...opt.groupPrices };
      delete updated[size];
      return { ...opt, groupPrices: updated };
    }));
  };

  // Pricing Option Handlers
  const addPricingOption = () => {
    const initialGroupPrices = {};
    groups.forEach(size => {
      initialGroupPrices[size] = { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
    });
    setPricingOptions([
      ...pricingOptions,
      {
        id: Date.now().toString(),
        hotelName: '',
        mealPlan: 'Breakfast',
        travelType: 'Private Coach',
        groupPrices: initialGroupPrices
      }
    ]);
  };

  const deletePricingOption = (id) => {
    setPricingOptions(pricingOptions.filter(opt => opt.id !== id));
  };

  const updatePricingOptionField = (id, key, value) => {
    setPricingOptions(pricingOptions.map(opt => 
      opt.id === id ? { ...opt, [key]: value } : opt
    ));
  };

  const updatePricingOptionGroupPrice = (id, size, field, value) => {
    setPricingOptions(pricingOptions.map(opt => {
      if (opt.id === id) {
        const currentGroupPrices = { ...opt.groupPrices };
        const currentPricesForSize = { ...(currentGroupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 }) };
        currentPricesForSize[field] = parseFloat(value) || 0;
        currentGroupPrices[size] = currentPricesForSize;
        return { ...opt, groupPrices: currentGroupPrices };
      }
      return opt;
    }));
  };

  // Calculate Combined Group Totals
  const getCombinedGroupTotals = () => {
    let total = 0;
    pricingOptions.forEach(opt => {
      groups.forEach(size => {
        const prices = opt.groupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
        total += (prices.hotelPrice + prices.mealPrice + prices.travelPrice + prices.otherPrice);
      });
    });
    return total;
  };

  const getLowestPerPerson = () => {
    let lowest = Infinity;
    pricingOptions.forEach(opt => {
      groups.forEach(size => {
        if (size > 0) {
          const prices = opt.groupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
          const grandTotal = prices.hotelPrice + prices.mealPrice + prices.travelPrice + prices.otherPrice;
          const rate = grandTotal / size;
          if (rate < lowest) lowest = rate;
        }
      });
    });
    return lowest === Infinity ? 0 : Math.round(lowest);
  };

  const getHighestPerPerson = () => {
    let highest = 0;
    pricingOptions.forEach(opt => {
      groups.forEach(size => {
        if (size > 0) {
          const prices = opt.groupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
          const grandTotal = prices.hotelPrice + prices.mealPrice + prices.travelPrice + prices.otherPrice;
          const rate = grandTotal / size;
          if (rate > highest) highest = rate;
        }
      });
    });
    return Math.round(highest);
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Authorization token missing. Please login again.");
      return;
    }

    if (pricingOptions.length === 0) {
      alert("Please add at least one hotel pricing option before completing the trip.");
      return;
    }

    try {
      const placeIds = itineraryDays.map(d => d.place).filter(Boolean);

      const step1Res = await fetch('/api/itinerary/step1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: customerName,
          contact_name: contactName,
          event_title: tripTitle,
          trip_start_date: startDate,
          trip_end_date: endDate,
          inclusions: selectedInclusions,
          exclusions: selectedExclusions,
          policies: selectedPolicies,
          important_notes: selectedImportantNotes,
          places: placeIds
        })
      });

      if (!step1Res.ok) {
        const errData = await step1Res.json();
        alert(`Step 1 Failed: ${errData.error || 'Check fields'}`);
        return;
      }
      const step1Data = await step1Res.json();
      const draftToken = step1Data.draft_token;

      // 2. Submit Step 2 Days to Redis Cache
      const step2Res = await fetch('/api/itinerary/step2/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          draft_token: draftToken,
          days: itineraryDays.map((day) => {
            const dateObj = new Date(new Date(startDate).getTime() + (day.trip_day - 1) * 24 * 60 * 60 * 1000);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const yyyy_mm_dd = `${yyyy}-${mm}-${dd}`;

            return {
              trip_day: day.trip_day,
              trip_date: yyyy_mm_dd,
              meal_plan: day.meal_plan || 'Breakfast',
              place: day.place || null,
              description: day.description || '',
              notes: day.notes || '',
              items: day.items || []
            };
          })
        })
      });

      if (!step2Res.ok) {
        const errData = await step2Res.json();
        alert(`Step 2 Failed: ${errData.error || 'Check itinerary details'}`);
        return;
      }

      // 3. Final submission
      const backendGroups = [];
      pricingOptions.forEach(opt => {
        const matchedHotel = availableHotels.find(h => h.name.toLowerCase() === opt.hotelName.toLowerCase());
        groups.forEach(size => {
          const prices = opt.groupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
          backendGroups.push({
            group_size: size,
            hotel: matchedHotel ? matchedHotel.id : null,
            hotel_price: prices.hotelPrice,
            meal_price: prices.mealPrice,
            meals_included: opt.mealPlan,
            travel_price: prices.travelPrice,
            travel_type: opt.travelType,
            other_charges: prices.otherPrice,
            other_charge_type: 'Service Fee'
          });
        });
      });

      const finalRes = await fetch('/api/itinerary/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          draft_token: draftToken,
          groups: backendGroups,
          trip_id: tripId || null
        })
      });

      if (finalRes.ok) {
        alert(tripId ? "Trip updated successfully!" : "Trip created successfully!");
        
        if (tripId && setActiveTab) {
          if (setEditTripId) setEditTripId(null);
          setActiveTab('Trip Inventory');
        } else {
          setStep(1);
          setCustomerName('');
          setContactName('');
          setTripTitle('');
          setStartDate('');
          setEndDate('');
          setItineraryDays([]);
          setSelectedInclusions([]);
          setSelectedExclusions([]);
          setSelectedPolicies([]);
          setSelectedImportantNotes([]);
          setGroups([]);
          setPricingOptions([]);
        }
      } else {
        const errData = await finalRes.json();
        alert(`Submission Failed: ${errData.error || 'Check details'}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An unexpected error occurred during submission.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-8 select-none font-sans max-w-6xl mx-auto space-y-6">
      
      {/* Top Stepper Indicator row */}
      <div className="flex items-center justify-center gap-12 border-b border-slate-200/50 pb-6 mb-4">
        
        {/* Step 01 indicator */}
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === 1
              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : step > 1
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {step > 1 ? (
              <svg className="w-4.5 h-4.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : '01'}
          </div>
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Step 01</span>
            <span className={`block text-xs font-bold ${step === 1 ? 'text-slate-800' : 'text-slate-500'}`}>Customer Details</span>
          </div>
        </button>

        {/* Connector */}
        <span className="w-12 h-px bg-slate-200" />

        {/* Step 02 indicator */}
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === 2
              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : step > 2
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {step > 2 ? (
              <svg className="w-4.5 h-4.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : '02'}
          </div>
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Step 02</span>
            <span className={`block text-xs font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-500'}`}>Itinerary Builder</span>
          </div>
        </button>

        {/* Connector */}
        <span className="w-12 h-px bg-slate-200" />

        {/* Step 03 indicator */}
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === 3
              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {'03'}
          </div>
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Step 03</span>
            <span className={`block text-xs font-bold ${step === 3 ? 'text-slate-800' : 'text-slate-500'}`}>Pricing</span>
          </div>
        </button>

      </div>

      {/* -------------------- STEP 1: CUSTOMER DETAILS VIEW -------------------- */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form container */}
          <div className="lg:col-span-2 bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-sm font-bold text-slate-700 tracking-wider uppercase">
                Customer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Customer Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Contact Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter contact person..."
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Event / Trip Title *
              </label>
              <input
                type="text"
                required
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="e.g. Kerala Family Tour"
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Trip Start Date *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Trip End Date *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions, Exclusions, Policies Selection lists - Searchable Dropdowns */}
            <div className="space-y-4">
              <MultiSearchableSelect
                label="Inclusions"
                placeholder="Search and add inclusions..."
                options={inclusionsList}
                selectedValues={selectedInclusions}
                onChange={setSelectedInclusions}
              />

              <MultiSearchableSelect
                label="Exclusions"
                placeholder="Search and add exclusions..."
                options={exclusionsList}
                selectedValues={selectedExclusions}
                onChange={setSelectedExclusions}
              />

              <MultiSearchableSelect
                label="Policies"
                placeholder="Search and add policies..."
                options={policiesList}
                selectedValues={selectedPolicies}
                onChange={setSelectedPolicies}
              />

              <MultiSearchableSelect
                label="Important Notes"
                placeholder="Search and add important notes..."
                options={importantNotesList}
                selectedValues={selectedImportantNotes}
                onChange={setSelectedImportantNotes}
              />
            </div>

            {/* Info notice bar */}
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Enter the customer details precisely. These details will be used for all itinerary communications and official booking documents. Fields marked with an asterisk (*) are mandatory.
              </p>
            </div>
            
            {/* Continue footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <span>{tripId ? "Update & Continue" : "Save & Continue"}</span>
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>

          {/* Right info sidebar */}
          <div className="space-y-6">
            
            {/* User details card */}
            <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm text-center space-y-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto border border-slate-200 bg-slate-100">
                <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">{contactName || 'New Contact'}</h3>
                <span className="text-[11px] font-semibold text-blue-600 mt-1 block">{customerName || 'Draft Account'}</span>
              </div>

              <div className="py-2 border-y border-slate-100">

                <div className="flex justify-between items-center text-xs py-1.5">
                  <span className="text-slate-400 font-medium">Trip Duration</span>
                  <span className="text-slate-700 font-bold">{getDaysDuration()} Days</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1.5">
                  <span className="text-slate-400 font-medium">Created Date</span>
                  <span className="text-slate-700 font-bold">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                "Enter details to start building your dynamic vacation planner."
              </p>

            </div>

            {/* Quick tips card */}
            <div className="bg-amber-50/50 border border-amber-200/50 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Quick Tips</h4>
              <ul className="text-xs text-amber-800 space-y-2.5 list-disc pl-4 leading-normal font-semibold">
                <li>Double check the start and end dates for alignment with flight schedules.</li>
                <li>If the hotel is not listed, you can add it in the Itinerary step.</li>
                <li>Ensure the trip title is descriptive for easy search later.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- STEP 2: ITINERARY BUILDER VIEW -------------------- */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Breadcrumbs and headers */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{tripId ? "Edit Trip" : "Create New Trip"}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Build customer details, itinerary and pricing
              </p>

              {/* Summary row */}
              <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-[11px] font-bold">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Trip Name</span>
                  <span className="text-slate-800 block mt-0.5">{tripTitle || 'Not Set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Date Range</span>
                  <span className="text-slate-800 block mt-0.5">{startDate || 'N/A'} — {endDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Duration</span>
                  <span className="text-slate-800 block mt-0.5">{getDaysDuration()} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-60">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"                  placeholder="Search places or cities..."
                  className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/30"
                />
              </div>

              <div className="relative">
                <select className="appearance-none block w-32 pl-3.5 pr-8 py-2 text-[12px] bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold focus:outline-none cursor-pointer">
                  <option value="All Cities">All Cities</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-400 font-bold">{itineraryDays.length} Days Planned</span>
              <button 
                onClick={() => {
                  if (!startDate || !endDate) {
                    alert("Please select Trip Start Date and End Date first.");
                    return;
                  }
                  if (itineraryDays.length >= getDaysDuration()) {
                    alert(`You cannot create more days than the trip duration (${getDaysDuration()} Days).`);
                    return;
                  }
                  setEditingDayIndex(null);
                  setShowDayModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Day</span>
              </button>
            </div>
          </div>

          {/* Itinerary builder table list */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12" />
                    <th className="py-3 px-4 w-16">Day</th>
                    <th className="py-3 px-4 w-28">Date</th>
                    <th className="py-3 px-4 w-36">City</th>
                    <th className="py-3 px-4">Activities & Places</th>
                    <th className="py-3 px-4 w-40">Meals</th>
                    <th className="py-3 px-4 w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 align-middle">
                  {itineraryDays.length > 0 ? (
                    itineraryDays.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4 text-slate-300">
                          <svg className="w-4 h-4 cursor-grab active:cursor-grabbing" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </td>

                        <td className="py-4 px-4 font-bold">
                          <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
                            {d.day}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 font-semibold">
                          {d.date}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/50">
                              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </div>
                            <span className="font-bold text-slate-800">{d.city}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {d.activities.map((a) => (
                              <span key={a} className="inline-block text-[9px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                                {a}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <button className={`p-1.5 rounded-lg border transition-all ${d.meals.breakfast ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-300 border-slate-200'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>

                            <button className={`p-1.5 rounded-lg border transition-all ${d.meals.lunch ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-300 border-slate-200'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                              </svg>
                            </button>

                            <button className={`p-1.5 rounded-lg border transition-all ${d.meals.dinner ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-300 border-slate-200'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right text-slate-400">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingDayIndex(index);
                                setShowDayModal(true);
                              }}
                              title="Edit Day"
                              className="hover:text-blue-600 cursor-pointer p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDay(index)}
                              title="Delete Day"
                              className="hover:text-red-500 cursor-pointer p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 bg-white text-slate-400 text-xs font-semibold">
                        No itinerary days added yet. Click "Create Day" to start building.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Itinerary footer helper tip */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] text-slate-400 font-semibold">Pro-tip: Create or edit days chronologically. Date calculation adjusts automatically based on the start date.</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-slate-500 uppercase tracking-wider">Meal Included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500 uppercase tracking-wider">Exclusions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
            <button className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
              Discard Changes
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="py-2.5 px-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                {tripId ? "Update & Continue" : "Save & Continue"}
              </button>
            </div>
          </div>

        </div>
      )}
      {/* -------------------- STEP 3: PRICING VIEW -------------------- */}
      {step === 3 && (
        <div className="space-y-6">
          
          {/* Header block */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              Group-Wise Pricing Configurator
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              First define group sizes, then configure package pricing tier options for each hotel.
            </p>
          </div>

          {/* SECTION 1: Group sizes configuration */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Define Group Sizes (PAX)
            </h3>
            
            {/* Added group sizes list */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {groups.map(size => (
                <div 
                  key={size} 
                  className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-extrabold"
                >
                  <span>{size} PAX</span>
                  <button
                    type="button"
                    onClick={() => removeGroupSize(size)}
                    className="hover:text-red-500 font-bold ml-1 text-[13px] cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
              
              {/* Add group input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={newGroupSize}
                  onChange={(e) => setNewGroupSize(e.target.value)}
                  className="w-20 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                />
                <button
                  type="button"
                  onClick={addGroupSize}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  + Add Group
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Hotel options configuration */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Configure Hotel Pricing Tiers
              </h3>
              <button
                type="button"
                onClick={addPricingOption}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-colors"
              >
                + Add Hotel Pricing Option
              </button>
            </div>

            {pricingOptions.map((opt, optIdx) => (
              <div key={opt.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Option #{optIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => deletePricingOption(opt.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Delete Option
                  </button>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hotel</label>
                    <select
                      value={opt.hotelName}
                      onChange={(e) => updatePricingOptionField(opt.id, 'hotelName', e.target.value)}
                      className="block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
                    >
                      <option value="">Select Hotel</option>
                      {availableHotels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Meal Plan</label>
                    <select
                      value={opt.mealPlan}
                      onChange={(e) => updatePricingOptionField(opt.id, 'mealPlan', e.target.value)}
                      className="block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Half Board">Half Board</option>
                      <option value="Full Board">Full Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Travel Type</label>
                    <select
                      value={opt.travelType}
                      onChange={(e) => updatePricingOptionField(opt.id, 'travelType', e.target.value)}
                      className="block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
                    >
                      <option value="Private Coach">Private Coach</option>
                      <option value="SUV Fleet">SUV Fleet</option>
                      <option value="Travel Van">Travel Van</option>
                    </select>
                  </div>
                </div>

                {/* Table for group pricing configurations */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Group Size</th>
                        <th className="py-2.5 px-4">Hotel Price (₹)</th>
                        <th className="py-2.5 px-4">Meal Price (₹)</th>
                        <th className="py-2.5 px-4">Travel Price (₹)</th>
                        <th className="py-2.5 px-4">Other Price (₹)</th>
                        <th className="py-2.5 px-4 text-right">Sub-total</th>
                        <th className="py-2.5 px-4 text-right">Per Person</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {groups.map(size => {
                        const prices = opt.groupPrices[size] || { hotelPrice: 0, mealPrice: 0, travelPrice: 0, otherPrice: 0 };
                        const subtotal = prices.hotelPrice + prices.mealPrice + prices.travelPrice + prices.otherPrice;
                        const perPersonRate = size > 0 ? Math.round(subtotal / size) : 0;
                        return (
                          <tr key={size} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">{size} PAX</td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                value={prices.hotelPrice || ''}
                                onChange={(e) => updatePricingOptionGroupPrice(opt.id, size, 'hotelPrice', e.target.value)}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                value={prices.mealPrice || ''}
                                onChange={(e) => updatePricingOptionGroupPrice(opt.id, size, 'mealPrice', e.target.value)}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                value={prices.travelPrice || ''}
                                onChange={(e) => updatePricingOptionGroupPrice(opt.id, size, 'travelPrice', e.target.value)}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                value={prices.otherPrice || ''}
                                onChange={(e) => updatePricingOptionGroupPrice(opt.id, size, 'otherPrice', e.target.value)}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold"
                              />
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                              ₹{subtotal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-right text-blue-600 font-bold">
                              ₹{perPersonRate.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                      {groups.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-400 italic">
                            No groups defined yet. Add groups above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {pricingOptions.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-bold text-xs">
                No hotel pricing configurations added yet. Click "Add Hotel Pricing Option" to start.
              </div>
            )}
          </div>

          {/* Pricing summary title */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <span>Pricing Summary</span>
              <svg className="w-4 h-4 text-slate-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </h3>
          </div>

          {/* Grid layout for summarized prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Lowest */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Lowest / Person</span>
                <span className="block text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                  ₹{getLowestPerPerson().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>

            {/* Box 2: Highest */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Highest / Person</span>
                <span className="block text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                  ₹{getHighestPerPerson().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>

            {/* Box 3: Total Group Value */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Group Value</span>
                <span className="block text-xl font-extrabold text-[#0c5957] tracking-tight mt-1">
                  ₹{getCombinedGroupTotals().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-12 h-12 bg-teal-50/50 border border-teal-100/50 rounded-xl flex items-center justify-center text-teal-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m0 5h6m0 5h6M5 8h.01M5 13h.01M5 18h.01" />
                </svg>
              </div>
            </div>

          </div>

          {/* Action footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200/50">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <span>&lt; Back to Itinerary</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 font-semibold">Draft autosaved at 14:42 PM</span>
              <button 
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{tripId ? "Update Trip" : "Save & Complete Trip"}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Add / Edit Day Modal popup */}
      <AddItineraryDay 
        show={showDayModal}
        onClose={() => {
          setShowDayModal(false);
          setEditingDayIndex(null);
        }}
        onSave={handleSaveDay}
        initialData={editingDayIndex !== null ? itineraryDays[editingDayIndex] : null}
        places={availablePlaces}
        cities={availableCities}
        countries={availableCountries}
        itineraryDays={itineraryDays}
        maxDays={getDaysDuration()}
      />

    </div>
  );
}
