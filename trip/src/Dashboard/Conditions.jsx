import React, { useState } from 'react';

export default function Conditions() {
  const [activeSubTab, setActiveSubTab] = useState('Inclusions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('STANDARD');

  // Sample data matching the mockup layout and values
  const [inclusions, setInclusions] = useState([
    {
      id: 1,
      title: 'Daily breakfast',
      badge: 'STANDARD',
      description: 'Breakfast included during the complete stay at the designated hotels.',
      icon: (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Airport transfer',
      badge: 'STANDARD',
      description: 'Pickup and drop-off included via private air-conditioned vehicle.',
      icon: (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Hotel accommodation',
      badge: 'STANDARD',
      description: 'Accommodation as mentioned in the itinerary in 4-star or higher category hotels.',
      icon: (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Local Tour Guide',
      badge: 'STANDARD',
      description: 'Professional English-speaking guide for all major sightseeing spots.',
      icon: (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 5,
      title: 'Entrance Fees',
      badge: 'STANDARD',
      description: 'All monument entrance fees as per the itinerary are covered.',
      icon: (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]);

  const [exclusions, setExclusions] = useState([
    {
      id: 1,
      title: 'Personal Expenses',
      badge: 'STANDARD',
      description: 'Laundry, telephone calls, tips, and items of personal nature.',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Visa Fees',
      badge: 'STANDARD',
      description: 'Visa documentation fees and embassy submission charges.',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]);

  const [policies, setPolicies] = useState([
    {
      id: 1,
      title: 'Cancellation Policy',
      badge: 'LEGAL',
      description: 'Free cancellation up to 14 days before departure. 50% charge applicable thereafter.',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ]);

  // Handlers
  const handleDelete = (id, tabType) => {
    if (tabType === 'Inclusions') {
      setInclusions(inclusions.filter(item => item.id !== id));
    } else if (tabType === 'Exclusions') {
      setExclusions(exclusions.filter(item => item.id !== id));
    } else {
      setPolicies(policies.filter(item => item.id !== id));
    }
  };
  
    // =========================
  const subTabs = [
    {
      name: "Inclusions",
      icon: "👤",
    },
    {
      name: "Exclusions",
      icon: "🔒",
    },
    {
      name: "Billing",
      icon: "💳",
    },
  ];

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      badge: newType,
      description: newDesc,
      icon: activeSubTab === 'Inclusions' ? (
        <svg className="w-5 h-5 text-[#0d6b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : activeSubTab === 'Exclusions' ? (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    };

    if (activeSubTab === 'Inclusions') {
      setInclusions([newItem, ...inclusions]);
    } else if (activeSubTab === 'Exclusions') {
      setExclusions([newItem, ...exclusions]);
    } else {
      setPolicies([newItem, ...policies]);
    }

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const getFilteredItems = () => {
    const list = activeSubTab === 'Inclusions' ? inclusions : activeSubTab === 'Exclusions' ? exclusions : policies;
    return list.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentList = getFilteredItems();

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Trip Conditions
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">
            Configure inclusions, exclusions, and legal policies for travel packages.
          </p>
        </div>

      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Inclusions */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Inclusions</span>
            <span className="block text-lg font-bold text-slate-800 tracking-tight mt-0.5">24 Items</span>
          </div>
        </div>

        {/* Card 2: Exclusions */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Exclusions</span>
            <span className="block text-lg font-bold text-slate-800 tracking-tight mt-0.5">12 Items</span>
          </div>
        </div>

        {/* Card 3: Policies */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Policies</span>
            <span className="block text-lg font-bold text-slate-800 tracking-tight mt-0.5">8 Items</span>
          </div>
        </div>

      </div>

      {/* Tabs list navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200/40 rounded-xl">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.name;

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveSubTab(tab.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

       
      </div>


      {/* Search and Action Row */}
      <div className="flex justify-between items-center">
        {/* Search */}
        <div className="relative w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-[15px] w-[15px] text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSubTab.toLowerCase()}...`}
            className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-100/60 border border-transparent rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500/20 focus:ring-[3px] focus:ring-teal-500/5 transition-all font-medium"
          />
        </div>

        {/* Add specific action button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#0d6b6e]/30 hover:border-[#0d6b6e] text-xs font-semibold text-[#0d6b6e] rounded-lg hover:bg-teal-50/40 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add {activeSubTab.substring(0, activeSubTab.length - 1)}</span>
        </button>
      </div>

      {/* Conditions list */}
      <div className="bg-white border border-slate-100/60 rounded-2xl shadow-sm overflow-hidden">
        {currentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left w-16">
                    Icon
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left w-48">
                    Condition
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                    Description
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-28">
                    Type
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200/80 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                    {/* Icon cell */}
                    <td className="py-4 px-5 align-middle">
                      <div className="w-9 h-9 bg-teal-50/40 rounded-lg flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                    </td>

                    {/* Condition Title cell */}
                    <td className="py-4 px-5 align-middle font-bold text-slate-800 tracking-tight">
                      {item.title}
                    </td>

                    {/* Description cell */}
                    <td className="py-4 px-5 align-middle text-slate-500 font-normal leading-relaxed">
                      {item.description}
                    </td>

                    {/* Badge cell */}
                    <td className="py-4 px-5 align-middle text-center">
                      <span className="inline-block text-[9px] font-bold bg-teal-50 text-[#0d6b6e] px-2 py-0.5 rounded uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="py-4 px-5 align-middle text-right text-slate-400">
                      <div className="flex items-center justify-end gap-3">
                        <button title="Edit" className="hover:text-slate-600 cursor-pointer p-1 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, activeSubTab)}
                          title="Delete"
                          className="hover:text-red-500 cursor-pointer p-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <div className="text-center py-10 bg-white border border-slate-100/60 rounded-2xl text-slate-400 text-xs">
            No conditions found matching your search.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
        <span className="text-[11px] text-slate-400 font-medium">
          Showing {currentList.length} of {activeSubTab === 'Inclusions' ? '24' : activeSubTab === 'Exclusions' ? '12' : '8'} items
        </span>

        {/* Page Nav */}
        <div className="flex items-center gap-1">
          <button className="p-1 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer">
            &lt;
          </button>
          <button className="w-7 h-7 bg-[#0d6b6e] text-white rounded-lg text-xs font-bold flex items-center justify-center">
            1
          </button>
          <button className="w-7 h-7 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer">
            2
          </button>
          <button className="w-7 h-7 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer">
            3
          </button>
          <button className="w-7 h-7 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer">
            4
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer">
            Next &gt;
          </button>
        </div>
      </div>

      {/* Add Modal Dialogue */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Add New {activeSubTab.substring(0, activeSubTab.length - 1)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure details for the new trip condition item.
              </p>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Guided City Tour"
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide detail guidelines about the condition..."
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Badge Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="LEGAL">Legal</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0d6b6e] hover:bg-[#0a5254] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
