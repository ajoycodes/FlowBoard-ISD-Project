import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'

export default function App(){
  const [route, setRoute] = React.useState('login')

  const renderRoute = () => {
    switch(route){
      case 'login': return <Login onNavigate={setRoute} />
      case 'register': return <Register onNavigate={setRoute} />
      case 'forgot': return <ForgotPassword onNavigate={setRoute} />
      case 'dashboard': return <Dashboard onNavigate={setRoute} />
      default: return <Login onNavigate={setRoute} />
    }
  }

  return (
    <div className="app-root">
      {renderRoute()}
    </div>
  )
}
