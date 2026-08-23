import React, { useState, useEffect } from 'react';

export default function AddItineraryDay({ show, onClose, onSave, initialData, places }) {
  const [tripDay, setTripDay] = useState(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState({
    Breakfast: false,
    Lunch: false,
    Snacks: false,
    Dinner: false
  });

  // Prefill details if editing
  useEffect(() => {
    if (show) {
      if (initialData) {
        setTripDay(initialData.trip_day || initialData.day || 1);
        setSelectedPlaceId(initialData.place || '');
        setDescription(initialData.description || '');
        setNotes(initialData.notes || '');
        
        // Parse meal_plan string e.g. "Breakfast, Lunch"
        const mealStr = initialData.meal_plan || '';
        const submittedMeals = mealStr.split(',').map(m => m.trim());
        setMeals({
          Breakfast: submittedMeals.includes('Breakfast'),
          Lunch: submittedMeals.includes('Lunch'),
          Snacks: submittedMeals.includes('Snacks'),
          Dinner: submittedMeals.includes('Dinner')
        });
      } else {
        setTripDay(1);
        setSelectedPlaceId('');
        setDescription('');
        setNotes('');
        setMeals({
          Breakfast: false,
          Lunch: false,
          Snacks: false,
          Dinner: false
        });
      }
    }
  }, [show, initialData]);

  const toggleMeal = (meal) => {
    setMeals(prev => ({
      ...prev,
      [meal]: !prev[meal]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPlaceId) {
      alert("Please select a place.");
      return;
    }

    const activeMeals = Object.keys(meals).filter(k => meals[k]);
    const mealPlan = activeMeals.join(', ');

    onSave({
      trip_day: parseInt(tripDay),
      place: selectedPlaceId,
      description,
      notes,
      meal_plan: mealPlan
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      
      {/* Modal Box */}
      <div className="w-full max-w-lg bg-slate-50 border border-slate-200/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2">
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
          
          {/* Day Number */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Day Number *
            </label>
            <input
              type="number"
              required
              min={1}
              value={tripDay}
              onChange={(e) => setTripDay(e.target.value)}
              className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Place Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Place / Attraction *
            </label>
            <div className="relative">
              <select
                required
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="appearance-none block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="">Select a place...</option>
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.city?.name || 'Unknown City'})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Meals Select Toggles */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Included Meals
            </label>
            <div className="flex gap-2">
              {Object.keys(meals).map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => toggleMeal(meal)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    meals[meal]
                      ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Day Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will travelers do on this day..."
              className="block w-full p-3.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Important Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Carry warm clothes, early checkout"
              className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
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
