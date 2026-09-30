import React, { useState, useEffect, useRef } from 'react';
import Toast from './Toast';

export default function Header({ activeTab, setActiveTab, onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const dropdownRef = useRef(null);

  const showToastMessage = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch logged in user profile
  const [logoUrl, setLogoUrl] = useState(null);

  const fetchLogo = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    fetch('/api/profile/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData && userData.account_id) {
          return fetch(`/api/accounts/${userData.account_id}/`, { headers: { 'Authorization': `Bearer ${token}` } });
        }
      })
      .then(res => (res && res.ok) ? res.json() : null)
      .then(accountData => {
        if (accountData && accountData.logo) {
          setLogoUrl(accountData.logo.startsWith('http') ? accountData.logo : `http://localhost:8000${accountData.logo}`);
        } else {
          setLogoUrl(null);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setUserProfile(data);
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
      });
      
      fetchLogo();
    }
    window.addEventListener('logoUpdated', fetchLogo);
    return () => window.removeEventListener('logoUpdated', fetchLogo);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('isLoggedIn');
    localStorage.clear();
    window.location.reload();
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToastMessage("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToastMessage("New password and confirm password do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToastMessage("New password must be at least 6 characters long.", "error");
      return;
    }

    const token = localStorage.getItem('access_token');
    setResetLoading(true);

    fetch('/api/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      setResetLoading(false);
      if (ok) {
        showToastMessage(data.message || "Password reset successfully!", "success");
        setShowResetModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToastMessage(data.error || data.detail || "Failed to reset password.", "error");
      }
    })
    .catch(err => {
      setResetLoading(false);
      showToastMessage("An error occurred. Please try again.", "error");
    });
  };

  const getDisplayName = () => {
    if (!userProfile) return "Planner";
    if (userProfile.first_name || userProfile.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    return userProfile.username ;
  };

  const getDisplayRole = () => {
    if (!userProfile) return "Premium Planner";
    if (userProfile.role) {
      return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
    }
    return "Premium Planner";
  };

  return (
    <header className="h-[76px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 select-none">
      {toast.show && <Toast show={true} message={toast.message} type={toast.type} />}

      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumbs / Page Title */}
        <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-slate-500 truncate">
          <span 
            onClick={() => setActiveTab && setActiveTab('Destinations')}
            className="hover:text-blue-600 transition-colors cursor-pointer font-bold hidden sm:inline">
            Destinations
          </span>
          <span className="hidden sm:inline">/</span>
          <span className="text-slate-800 font-extrabold truncate">{activeTab || 'Curator Manager'}</span>
        </div>
      </div>

      {/* Right-side Controls */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* Search Bar */}
        <div className="relative w-36 sm:w-64 group hidden xs:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-[15px] w-[15px] text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-9 pr-4 py-2 text-[12px] bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/30 focus:ring-[3px] focus:ring-blue-500/5 transition-all font-semibold"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer focus:outline-none">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 border border-white rounded-full" />
        </button>

        {/* Vertical divider */}
        <span className="w-px h-6 bg-slate-200 hidden sm:inline" />

        {/* Profile Dropdown Trigger & Panel Container */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-3.5 pl-1 cursor-pointer group">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                {getDisplayName()}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 leading-none">
                {getDisplayRole()}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="User Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-full h-full text-slate-400 bg-slate-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <svg 
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown Menu Card (Matches image design) */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="px-5 py-2.5 text-center">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {getDisplayRole()}
                </p>
              </div>

              <div className="my-2 border-t border-slate-100" />

              {/* Action items */}
              <div className="px-2 space-y-1">
                {/* Reset Password */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowResetModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-2.5 cursor-pointer">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Reset Password</span>
                </button>

                {/* Profile Settings */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (setActiveTab) setActiveTab('Settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-2.5 cursor-pointer">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
              </div>

              <div className="my-2 border-t border-slate-100" />

              {/* Logout */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-all flex items-center gap-2.5 cursor-pointer">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Reset Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update your account password</p>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
