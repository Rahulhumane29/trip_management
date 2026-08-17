import React from 'react';

export default function PerformanceChart() {
  // Chart coordinates mapped for a viewBox of 0 0 600 240
  // Values representing Jan (40), Feb (48), Mar (42), Apr (58), May (52), Jun (68), Jul (82)
  const linePath = "M 50,140 C 120,110 160,140 230,120 C 300,100 340,120 410,95 C 480,70 520,50 590,40";
  const areaPath = `${linePath} L 590,200 L 50,200 Z`;

  return (
    <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all select-none">
      
      {/* Header of Chart */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">
            Trip Performance
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Volume vs Revenue growth over the last 7 months
          </p>
        </div>
        
        {/* Dropdown filter */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
          <span>This Year</span>
          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full h-[220px]">
        <svg viewBox="0 0 640 240" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            {/* Linear gradient for area fill underneath the curve */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff6a00" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <line x1="50" y1="40" x2="590" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="80" x2="590" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="120" x2="590" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="160" x2="590" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="200" x2="590" y2="200" stroke="#e2e8f0" strokeWidth="1.2" />

          {/* Y-Axis Labels */}
          <text x="35" y="44" className="text-[10px] font-semibold text-slate-400" textAnchor="end">100</text>
          <text x="35" y="84" className="text-[10px] font-semibold text-slate-400" textAnchor="end">75</text>
          <text x="35" y="124" className="text-[10px] font-semibold text-slate-400" textAnchor="end">50</text>
          <text x="35" y="164" className="text-[10px] font-semibold text-slate-400" textAnchor="end">25</text>
          <text x="35" y="204" className="text-[10px] font-semibold text-slate-400" textAnchor="end">0</text>

          {/* Area Fill path */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line stroke path */}
          <path d={linePath} fill="none" stroke="#ff6a00" strokeWidth="2.5" strokeLinecap="round" />

          {/* X-Axis Labels */}
          <text x="50" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Jan</text>
          <text x="140" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Feb</text>
          <text x="230" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Mar</text>
          <text x="320" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Apr</text>
          <text x="410" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">May</text>
          <text x="500" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Jun</text>
          <text x="590" y="222" className="text-[10px] font-semibold text-slate-400" textAnchor="middle">Jul</text>
        </svg>
      </div>

      {/* Legend Indicator */}
      <div className="flex justify-center items-center gap-2 mt-2">
        <span className="w-2.5 h-2.5 rounded bg-[#ff6a00]" />
        <span className="text-[11px] font-semibold text-slate-500">Total Trips</span>
      </div>

    </div>
  );
}
