import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import PerformanceChart from '../components/PerformanceChart';
import Account from './Account';
import Conditions from './Conditions';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // KPI Data
  const stats = [
    {
      title: "Total Trips",
      value: "1,284",
      change: "+12%",
      isNegative: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Active Trips",
      value: "142",
      change: "+5%",
      isNegative: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Pending Approvals",
      value: "28",
      change: "-2%",
      isNegative: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Completed",
      value: "1,114",
      change: "+18%",
      isNegative: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex select-none">
      
      {/* Fixed Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        
        {/* Fixed Header */}
        <Header />

        {/* Content Wrapper */}
        <main className="flex-1 pt-[76px] p-8 space-y-8">
          
          {activeTab === 'Settings' ? (
            <Account />
          ) : activeTab === 'Destinations' ? (
            <Conditions />
          ) : (
            <>
              {/* Main Content Title Bar */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                    Operational Overview
                  </h2>
                  <p className="text-[13px] text-slate-500 mt-1 font-normal">
                    Welcome back, Alex. Here's what's happening with your trips today.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {/* Export button */}
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                    <svg className="w-4 h-4 text-slate-400 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export</span>
                  </button>

                  {/* Create New Trip button */}
                  <button className="flex items-center gap-2 px-4.5 py-2.5 bg-[#ff6a00] hover:bg-[#e65c00] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-orange-500/10 hover:shadow-orange-500/20">
                    <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Trip</span>
                  </button>
                </div>
              </div>

              {/* Row of Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <StatsCard
                    key={i}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    isNegative={stat.isNegative}
                    icon={stat.icon}
                  />
                ))}
              </div>

              {/* Grid Layout for Performance Chart and secondary panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Trip Performance Chart (spans 2 columns) */}
                <div className="lg:col-span-2">
                  <PerformanceChart />
                </div>

                {/* Premium recent activities or upcoming schedule placeholder panel */}
                <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                      Recent Activities
                    </h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* Activities list */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-slate-700">Trip to Paris Approved</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">By Alex Rivera • 2 hrs ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-slate-700">Flight Booking Pending</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Trip to Tokyo • 5 hrs ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5b6bf9] mt-1.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-slate-700">New Client Onboarded</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Johnathan Miller • 1 day ago</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-slate-700">Itinerary Updated</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Trip to London • 2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>

    </div>
  );
}
