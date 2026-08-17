import React, { useState } from 'react'
import Login from './auth/Login'
import Dashboard from './dashboard/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return isLoggedIn ? (
    <Dashboard />
  ) : (
    <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  )
}

export default App