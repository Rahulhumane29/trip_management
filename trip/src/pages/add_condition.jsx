import React, { useState, useEffect } from 'react';

export default function AddCondition({ show, onClose, onSave, initialData, activeSubTab }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeType, setBadgeType] = useState('STANDARD');

  // Pre-fill fields if editing
  useEffect(() => {
    if (show) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setBadgeType(initialData.badge || 'STANDARD');
      } else {
        setTitle('');
        setDescription('');
        setBadgeType('STANDARD');
      }
    }
  }, [show, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      badge: badgeType
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
            {initialData ? `Edit ${activeSubTab.substring(0, activeSubTab.length - 1)}` : `Add New ${activeSubTab.substring(0, activeSubTab.length - 1)}`}
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
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily breakfast or Personal expenses"
              className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information regarding this condition..."
              className="block w-full p-3.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Badge Type
            </label>
            <div className="relative">
              <select
                value={badgeType}
                onChange={(e) => setBadgeType(e.target.value)}
                className="appearance-none block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="LEGAL">Legal</option>
                <option value="OPTIONAL">Optional</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
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
              <span>{initialData ? 'Update Details' : 'Save Item'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
