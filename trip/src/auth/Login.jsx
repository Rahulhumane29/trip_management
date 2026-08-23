import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    // Call real Django auth API
    fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    })
    .then(async (res) => {
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Server error (${res.status}). Please make sure your Django backend server is running.`);
      }
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password.');
      }
      return data;
    })
    .then((data) => {
      setLoading(false);
      setSuccess(true);
      // Save tokens and user data
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      }
    })
    .catch((err) => {
      setLoading(false);
      setError(err.message || 'Server error. Please try again.');
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#0b1329] overflow-hidden font-sans select-none">
      {/* Premium Background Wave & Glow Effects */}
      <div className="absolute inset-0 z-0">
        {/* Radial background gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-950/40 blur-[130px] pointer-events-none" />
        {/* Curved blue wave light overlay */}
        <div className="absolute top-[25%] left-[-50%] w-[200%] h-[50%] -rotate-12 bg-gradient-to-r from-transparent via-blue-600/10 to-transparent blur-[100px] pointer-events-none" />
        <div className="absolute top-[35%] left-[-50%] w-[200%] h-[40%] -rotate-6 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-[120px] pointer-events-none" />
      </div>

      {/* Empty top spacer to help center the card vertically while reserving space for footer */}
      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[420px] bg-[#f3f4f6] rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-9 transition-all duration-300 hover:shadow-indigo-950/20">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-800 tracking-tight leading-tight">
              Sign In
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-normal">
              Enter your professional credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs text-green-600 bg-green-50 border border-green-200 p-2.5 rounded-lg">
                Success! Redirecting...
              </div>
            )}

            {/* Email or Username Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email or Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* User/Email icon */}
                  <svg className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or username"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-normal"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-[#5b6bf9] hover:underline font-medium focus:outline-none">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Lock icon */}
                  <svg className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-100 transition-all font-normal tracking-wide"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    /* Eye open icon */
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    /* Eye closed / slashed icon */
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.17-5.356m2.63-1.239A7.95 7.95 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.4m-9.728-10.7a9 9 0 00-6.07 6.07" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#5b6bf9] hover:bg-[#4a58e3] active:bg-[#3e4bd1] text-white text-sm font-semibold shadow-md shadow-indigo-200/10 hover:shadow-indigo-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="h-[15px] w-[15px] stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Separation line & Sign Up */}
          <div className="mt-6 pt-6 border-t border-slate-200/70 text-center">
            <span className="text-xs text-slate-500 font-normal">
              Don't have an account?{' '}
              <a href="#signup" className="text-[#5b6bf9] hover:underline font-semibold focus:outline-none">
                Sign Up
              </a>
            </span>
          </div>

        </div>
      </div>

      {/* Footer Links */}
      <footer className="w-full py-6 text-center z-10 bg-gradient-to-t from-[#090f20]/60 to-transparent">
        <div className="flex justify-center items-center gap-6 text-xs text-slate-500/80 font-normal">
          <a href="#privacy" className="hover:text-slate-300 transition-colors focus:outline-none">
            Privacy Policy
          </a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
          <a href="#terms" className="hover:text-slate-300 transition-colors focus:outline-none">
            Terms of Service
          </a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700/50" />
          <a href="#help" className="hover:text-slate-300 transition-colors focus:outline-none">
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
}
