import React from 'react';

export default function StatsCard({ title, value, change, isNegative, icon }) {
  return (
    <div className="flex-1 min-w-[200px] bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all select-none">
      
      {/* Icon and Change Badge Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Rounded Icon container with soft orange/peach/slate tones */}
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6a00]">
          {icon}
        </div>

        {/* Change Badge */}
        <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
          isNegative
            ? 'bg-slate-100 text-slate-500'
            : 'bg-green-50 text-green-600'
        }`}>
          <span>{change}</span>
          <svg className="w-2.5 h-2.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isNegative ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            )}
          </svg>
        </div>
      </div>

      {/* Label and Value */}
      <div className="space-y-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span className="block text-2xl font-extrabold text-slate-800 tracking-tight">
          {value}
        </span>
      </div>

    </div>
  );
}
