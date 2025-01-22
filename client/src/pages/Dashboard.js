import React from 'react'
import './styles/Dashboard.css'
import NavigationBar from '../components/NavigationBar'
const Dashboard = () => {
  return (
    <div className='container'>
        <div className="dashboard-container">
          <h1 id='title'>SPOC LMSC 218</h1>
          <div className="navBar"><NavigationBar /></div>
          <div className="grid-container">
              <div className="allClasse"></div>
          </div>
      </div>
    </div>
  )
}

export default Dashboard
