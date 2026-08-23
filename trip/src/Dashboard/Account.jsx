import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";

export default function Account() {
  // =========================
  // Form State
  // =========================
  const [companyName, setCompanyName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [fax, setFax] = useState("");
  const [address, setAddress] = useState("");

  const [activeSubTab, setActiveSubTab] = useState("Account");
  const [saveStatus, setSaveStatus] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToastMessage = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // =========================
  // Load data dynamically
  // =========================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showToastMessage("Please login to manage account details.", "error");
      return;
    }

    // 1. Fetch authenticated user profile to read associated account id
    fetch('/api/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load user profile.");
      return res.json();
    })
    .then(userData => {
      if (userData.account_id) {
        setCompanyId(userData.account_id);
        // 2. Fetch associated account details
        return fetch(`/api/accounts/${userData.account_id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      throw new Error("No company account associated with your user profile.");
    })
    .then(res => {
      if (res && !res.ok) throw new Error("Failed to load account details.");
      return res ? res.json() : null;
    })
    .then(accountData => {
      if (accountData) {
        setCompanyName(accountData.name || "");
        setTelephone(accountData.telephone || "");
        setEmail(accountData.email || "");
        setFax(accountData.fax || "");
        setAddress(accountData.address || "");
        showToastMessage("Account details loaded successfully.", "success");
      }
    })
    .catch(err => {
      console.error(err);
      showToastMessage(err.message || "Failed to load company details.", "error");
    });
  }, []);

  // =========================
  // Save
  // =========================
  const handleSave = (e) => {
    if (e) {
      e.preventDefault();
    }
    const token = localStorage.getItem('access_token');
    if (!token) {
      showToastMessage("Please login to save changes.", "error");
      return;
    }

    setSaveStatus("Saving...");

    const url = companyId ? `/api/accounts/${companyId}/` : '/api/accounts/';
    const method = companyId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: companyName || "My Company",
        telephone: telephone,
        email: email,
        fax: fax,
        address: address
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(Object.values(data).flat().join(' ') || 'Failed to save changes.');
      }
      return data;
    })
    .then(data => {
      setSaveStatus("");
      if (!companyId && data.id) {
        setCompanyId(data.id);
      }
      setIsEditing(false);
      showToastMessage("Changes saved successfully!", "success");
    })
    .catch(err => {
      setSaveStatus("");
      showToastMessage(err.message || "Error saving changes.", "error");
    });
  };

  // =========================
  // Reset
  // =========================
  const handleReset = () => {
    const token = localStorage.getItem('access_token');
    if (!token || !companyId) return;

    setSaveStatus("Resetting...");
    fetch(`/api/accounts/${companyId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(accountData => {
      setCompanyName(accountData.name || "");
      setTelephone(accountData.telephone || "");
      setEmail(accountData.email || "");
      setFax(accountData.fax || "");
      setAddress(accountData.address || "");
      setSaveStatus("");
      showToastMessage("Reset successfully.", "success");
    })
    .catch(err => {
      setSaveStatus("");
      showToastMessage("Reset failed.", "error");
    });
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
    onClick={() => setIsEditing(!isEditing)}
    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
      isEditing 
        ? "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100" 
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    {isEditing ? (
      <>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      </>
    ) : (
      <>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </>
    )}
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
                  disabled={!isEditing}
                  placeholder="Enter company name"
                  className={`block w-full px-3 py-2.5 text-sm border rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium ${
                    isEditing ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-100/80 cursor-not-allowed"
                  }`}
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
                  disabled={!isEditing}
                  placeholder="Enter telephone number"
                  className={`block w-full px-3 py-2.5 text-sm border rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium ${
                    isEditing ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-100/80 cursor-not-allowed"
                  }`}
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter work email"
                    className={`block w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium ${
                      isEditing ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-100/80 cursor-not-allowed"
                    }`}
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
                  disabled={!isEditing}
                  placeholder="Enter fax number"
                  className={`block w-full px-3 py-2.5 text-sm border rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium ${
                    isEditing ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-100/80 cursor-not-allowed"
                  }`}
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
                disabled={!isEditing}
                placeholder="Enter company address"
                className={`block w-full px-3.5 py-2.5 text-sm border rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-medium resize-none leading-relaxed ${
                  isEditing ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-100/80 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Form Save Button */}
            {isEditing && (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5b6bf9] hover:bg-[#4a58e3] active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-indigo-200/10"
                >
                  Save Details
                </button>
              </div>
            )}

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

      {/* Toast Notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />

    </div>
  );
}