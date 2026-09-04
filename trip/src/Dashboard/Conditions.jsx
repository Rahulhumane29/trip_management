import React, { useState, useEffect } from 'react';
import AddCondition from '../pages/add_condition';

export default function Conditions() {
  const [activeSubTab, setActiveSubTab] = useState('Inclusions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // States for backend data
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [importantNotes, setImportantNotes] = useState([]);

  // Load all data
  const loadData = () => {
    fetch('/api/conditions/inclusions/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.text.split(' | ');
            return {
              id: item.id,
              title: parts[0] || item.text,
              description: parts[1] || '',
              badge: parts[2] || 'STANDARD'
            };
          });
          setInclusions(formatted);
        }
      })
      .catch(err => console.error("Error loading inclusions:", err));

    fetch('/api/conditions/exclusions/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.text.split(' | ');
            return {
              id: item.id,
              title: parts[0] || item.text,
              description: parts[1] || '',
              badge: parts[2] || 'STANDARD'
            };
          });
          setExclusions(formatted);
        }
      })
      .catch(err => console.error("Error loading exclusions:", err));

    fetch('/api/conditions/policies/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.text.split(' | ');
            return {
              id: item.id,
              title: parts[0] || item.text,
              description: parts[1] || '',
              badge: parts[2] || 'LEGAL'
            };
          });
          setPolicies(formatted);
        }
      })
      .catch(err => console.error("Error loading policies:", err));

    fetch('/api/conditions/important_notes/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(item => {
            const parts = item.text.split(' | ');
            return {
              id: item.id,
              title: parts[0] || item.text,
              description: parts[1] || '',
              badge: parts[2] || 'STANDARD'
            };
          });
          setImportantNotes(formatted);
        }
      })
      .catch(err => console.error("Error loading important notes:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleDelete = (id, tabType) => {
    const token = localStorage.getItem('access_token');
    const endpointMap = {
      'Inclusions': 'inclusions',
      'Exclusions': 'exclusions',
      'Policies': 'policies',
      'Important Notes': 'important_notes'
    };
    const endpoint = endpointMap[tabType] || 'inclusions';

    fetch(`/api/conditions/${endpoint}/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        if (tabType === 'Inclusions') {
          setInclusions(inclusions.filter(item => item.id !== id));
        } else if (tabType === 'Exclusions') {
          setExclusions(exclusions.filter(item => item.id !== id));
        } else if (tabType === 'Policies') {
          setPolicies(policies.filter(item => item.id !== id));
        } else {
          setImportantNotes(importantNotes.filter(item => item.id !== id));
        }
      }
    })
    .catch(err => console.error("Error deleting item:", err));
  };

  const handleSaveItem = (newVal) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Authorization token missing. Please login again.");
      return;
    }

    const endpointMap = {
      'Inclusions': 'inclusions',
      'Exclusions': 'exclusions',
      'Policies': 'policies',
      'Important Notes': 'important_notes'
    };
    const endpoint = endpointMap[activeSubTab] || 'inclusions';

    const url = editingItem ? `/api/conditions/${endpoint}/${editingItem.id}/` : `/api/conditions/${endpoint}/`;
    const method = editingItem ? 'PUT' : 'POST';

    // Concatenate details into single text field
    const serializedText = `${newVal.title} | ${newVal.description} | ${newVal.badge}`;

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: serializedText
      })
    })
    .then(res => {
      if (res.ok) {
        loadData();
        setShowAddModal(false);
        setEditingItem(null);
      } else {
        alert("Failed to save condition item");
      }
    })
    .catch(err => console.error("Error saving condition:", err));
  };

  const subTabs = [
    { name: "Inclusions", icon: "➕" },
    { name: "Exclusions", icon: "➖" },
    { name: "Policies", icon: "📜" },
    { name: "Important Notes", icon: "📝" }
  ];

  const getFilteredItems = () => {
    const list = 
      activeSubTab === 'Inclusions' 
        ? inclusions 
        : activeSubTab === 'Exclusions' 
        ? exclusions 
        : activeSubTab === 'Policies'
        ? policies
        : importantNotes;
    return list.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentList = getFilteredItems();

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto font-sans">
      
      {/* Title Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Trip Conditions
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">
            Configure inclusions, exclusions, and legal policies for travel packages.
          </p>
        </div>

        {/* Add Condition button */}
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-[#0070f3] hover:bg-[#0060d0] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add {activeSubTab.endsWith('s') ? activeSubTab.substring(0, activeSubTab.length - 1) : activeSubTab}</span>
        </button>
      </div>

      {/* Summary KPI row of 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        {/* Card 1: Inclusions */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Inclusions</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{inclusions.length}</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Exclusions */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Exclusions</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{exclusions.length}</span>
          </div>
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Policies */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Policies</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{policies.length}</span>
          </div>
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Important Notes */}
        <div className="bg-white border border-slate-100/60 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Important Notes</span>
            <span className="block text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{importantNotes.length}</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Inventory Filter Bar Card */}
      <div className="bg-white border border-slate-100/60 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Header Filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200/40 rounded-xl">
            {subTabs.map((tab) => {
              const isActive = activeSubTab === tab.name;
              return (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(tab.name);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-64 group">
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
                className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-100/50 border border-slate-200/20 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/20 focus:ring-[3px] focus:ring-blue-500/5 transition-all font-medium"
              />
            </div>

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Conditions Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {currentList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Condition Item
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
                      Description
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-28">
                      Badge
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right w-28">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {currentList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Condition title */}
                      <td className="py-4.5 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 border border-slate-200/50 rounded-xl flex items-center justify-center shrink-0 ${
                            activeSubTab === 'Inclusions' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : activeSubTab === 'Exclusions' 
                              ? 'bg-rose-50 text-rose-500' 
                              : activeSubTab === 'Policies'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-indigo-50 text-indigo-650'
                          }`}>
                            {activeSubTab === 'Inclusions' ? '➕' : activeSubTab === 'Exclusions' ? '➖' : activeSubTab === 'Policies' ? '📜' : '📝'}
                          </div>
                          <span className="block text-sm font-bold text-slate-800 tracking-tight leading-tight">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4.5 px-6 align-middle text-slate-500 font-semibold text-xs leading-relaxed max-w-sm truncate">
                        {item.description}
                      </td>

                      {/* Badge Type */}
                      <td className="py-4.5 px-6 align-middle text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          item.badge === 'STANDARD'
                            ? 'bg-slate-100 text-slate-800'
                            : item.badge === 'PREMIUM'
                            ? 'bg-teal-50 text-teal-600'
                            : item.badge === 'LEGAL'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {item.badge}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 align-middle text-right text-slate-400">
                        <div className="flex items-center justify-end gap-3.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(item.id, activeSubTab)}
                            title="Delete"
                            className="hover:text-red-500 cursor-pointer p-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingItem(item);
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
              No condition items found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
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

      {/* Add/Edit Modal */}
      <AddCondition 
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
        activeSubTab={activeSubTab}
      />

    </div>
  );
}
