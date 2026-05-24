import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'

const initialRoute = { name: 'login' }

export default function App(){
  const [route, setRoute] = React.useState(initialRoute)

  const navigate = (name, payload = {}) => {
    setRoute({ name, ...payload })
  }

  let view = null

  switch(route.name){
    case 'register':
      view = <Register onNavigate={navigate} />
      break
    case 'forgot':
      view = <ForgotPassword onNavigate={navigate} />
      break
    case 'dashboard':
      view = <Dashboard onNavigate={navigate} userName="Fariha" />
      break
    case 'workspace':
      view = <Workspace workspaceId={route.workspaceId} onNavigate={navigate} />
      break
    case 'login':
    default:
      view = <Login onNavigate={navigate} />
      break
  }

  return <div className="app-shell">{view}</div>
}
