import React from 'react';

export default function Header() {
  return (
    <header className="h-[76px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 select-none">
      
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
        <span className="hover:text-blue-600 transition-colors cursor-pointer font-bold">Destinations</span>
        <span>/</span>
        <span className="text-slate-800 font-extrabold">Curator Manager</span>
      </div>

      {/* Right-side Controls */}
      <div className="flex items-center gap-6">
        
        {/* Search Bar */}
        <div className="relative w-64 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-[15px] w-[15px] text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search destinations, tags, or media..."
            className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/30 focus:ring-[3px] focus:ring-blue-500/5 transition-all font-semibold"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer focus:outline-none">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Brand alert dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 border border-white rounded-full" />
        </button>

        {/* Vertical divider */}
        <span className="w-px h-6 bg-slate-200" />

        {/* User profile dropdown block */}
        <div className="flex items-center gap-3.5 pl-1 cursor-pointer group">
          <div className="flex flex-col text-right">
            <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">Alex Rivera</span>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 leading-none">Travel Coordinator</span>
          </div>
          
          <div className="relative">
            {/* User Avatar */}
            <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
              <svg className="w-full h-full text-slate-400 bg-slate-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {/* Green active status indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

      </div>
    </header>
  );
}
