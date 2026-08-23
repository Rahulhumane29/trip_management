import React, { useState } from 'react'
import Login from './auth/Login'
import Dashboard from './dashboard/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  return isLoggedIn ? (
    <Dashboard />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

export default App