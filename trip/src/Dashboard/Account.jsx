import React, { useState } from "react";

export default function Account() {
  // =========================
  // Form State
  // =========================
  const [companyName, setCompanyName] = useState("Enterprise AI");
  const [telephone, setTelephone] = useState("+91 9876543210");
  const [email, setEmail] = useState("alex.chen@enterprise.ai");
  const [fax, setFax] = useState("+91 2222222222");
  const [address, setAddress] = useState(
    "123 Main St, City, State 12345"
  );

  const [activeSubTab, setActiveSubTab] = useState("Account");
  const [saveStatus, setSaveStatus] = useState("");

  // =========================
  // Tabs
  // =========================
  const subTabs = [
    {
      name: "Account",
      icon: "👤",
    },
    {
      name: "Security",
      icon: "🔒",
    },
    {
      name: "Billing",
      icon: "💳",
    },
  ];

  // =========================
  // Save
  // =========================
  const handleSave = (e) => {
    if (e) {
      e.preventDefault();
    }

    setSaveStatus("Saving...");

    setTimeout(() => {
      setSaveStatus("Changes saved successfully!");

      setTimeout(() => {
        setSaveStatus("");
      }, 2500);
    }, 800);
  };

  // =========================
  // Reset
  // =========================
  const handleReset = () => {
    setCompanyName("Enterprise AI");
    setTelephone("+91 9876543210");
    setEmail("alex.chen@enterprise.ai");
    setFax("+91 2222222222");
    setAddress("123 Main St, City, State 12345");

    setSaveStatus("Reset to default values.");

    setTimeout(() => {
      setSaveStatus("");
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">

      {/* =========================================
          Header
      ========================================== */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
          Settings
        </h2>

        <p className="text-[13px] text-slate-500 mt-1 font-normal">
          Manage your account preferences, model defaults, and platform
          interface settings.
        </p>
      </div>

      {/* =========================================
          Tabs + Actions
      ========================================== */}
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

      {/* =========================================
          Save Status
      ========================================== */}
      {saveStatus && (
        <div
          className={`text-xs px-3.5 py-2.5 rounded-lg border font-medium ${
            saveStatus.includes("success")
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          {saveStatus}
        </div>
      )}

      {/* =========================================
          Main Content
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* =======================================
            Company Information
        ======================================== */}
        <div className="lg:col-span-2 bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm space-y-6">

          {/* Section Header */}
<div className="flex items-start justify-between gap-4">
  <div>
    <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">
      Company Information
    </h3>

    <p className="text-[12px] text-slate-400 mt-0.5 font-normal">
      Update your company details and contact information.
    </p>
  </div>

  <button
    type="button"
    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
  >
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      />
    </svg>

    Edit
  </button>
</div>
          {/* =====================================
              Profile Photo
          ====================================== */}
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
              <svg
                className="w-full h-full text-slate-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            {/* Photo Actions */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">

                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Change Photo
                </button>

                <button
                  type="button"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  Remove
                </button>

              </div>

              <span className="block text-[10px] text-slate-400 font-medium">
                JPG, GIF or PNG. Max size of 2MB.
              </span>
            </div>
          </div>

          {/* =====================================
              Form
          ====================================== */}
          <form onSubmit={handleSave} className="space-y-5">

            {/* Company Name + Telephone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Company Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Name
                </label>

                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="block w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telephone
                </label>

                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Enter telephone number"
                  className="block w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

            </div>

            {/* Email + Fax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Work Email
                </label>

                <div className="relative group">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium"
                  />

                </div>
              </div>

              {/* Fax */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Fax
                </label>

                <input
                  type="text"
                  value={fax}
                  onChange={(e) => setFax(e.target.value)}
                  placeholder="Enter fax number"
                  className="block w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Address
              </label>

              <textarea
                value={address}
                rows={3}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter company address"
                className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Form Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#5b6bf9] hover:bg-[#4a58e3] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Save Details
              </button>
            </div>

          </form>
        </div>

        {/* =======================================
            Subscription
        ======================================== */}
        <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6">

          <div className="space-y-5">

            {/* Header */}
            <div>
              <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">
                Active Subscription
              </h3>

              <p className="text-[12px] text-slate-400 mt-0.5 font-normal">
                Your current plan and billing cycle.
              </p>
            </div>

            {/* Plan Information */}
            <div className="bg-[#eef2ff] border border-indigo-100/60 p-4 rounded-xl space-y-4">

              <div className="flex justify-between items-center">

                <span className="text-[10px] font-bold bg-[#5b6bf9] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Enterprise Plus
                </span>

                <span className="text-xs font-bold text-[#5b6bf9]">
                  $149/mo
                </span>

              </div>

              <div>
                <span className="block text-xs font-extrabold text-slate-700">
                  Next billing date: Oct 24, 2026
                </span>
              </div>

              {/* Token Usage */}
              <div className="space-y-1.5">

                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-slate-400">
                    Token Usage
                  </span>

                  <span className="text-slate-600">
                    850k / 2.5M
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5b6bf9] rounded-full"
                    style={{ width: "34%" }}
                  />
                </div>

              </div>
            </div>

            {/* Payment Card */}
            <div className="flex justify-between items-center py-1.5">

              <div className="flex items-center gap-2.5">

                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>

                <span className="text-xs font-semibold text-slate-600">
                  Visa ending in 4242
                </span>

              </div>

              <button
                type="button"
                className="text-xs font-bold text-[#5b6bf9] hover:underline cursor-pointer"
              >
                Update
              </button>

            </div>

            <hr className="border-slate-100" />

            {/* Billing History */}
            <button
              type="button"
              className="w-full flex justify-between items-center py-1 cursor-pointer group text-left"
            >

              <div className="flex items-center gap-2.5">

                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                  Billing History
                </span>

              </div>

              <svg
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>

            </button>

          </div>

          {/* Upgrade Plan */}
          <button
            type="button"
            className="w-full py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Upgrade Plan
          </button>

        </div>
      </div>    
    </div>
  );
}