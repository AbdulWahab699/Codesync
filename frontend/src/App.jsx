import { useState } from 'react'
import AppRoutes from './routes/AppRoutes'


function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AppRoutes
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
    />
  )
}

export default App