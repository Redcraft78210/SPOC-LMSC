import React from 'react';
import './styles/Dashboard.css';
import NavigationBar from '../components/NavigationBar';
import PresentationCard from '../components/PresentationCard';
import SideRightCard from '../components/SideRightCard';
import TraductionToggle from '../components/TraductionToggle';
import DarkmodeButton from '../components/DarkmodeButton';
import StatForClasse from '../components/StatForClasse';
const Dashboard = () => {
  return (
    <div className='container'>
      <div className="dashboard-container">
        <div className="grid-container">
          <h1 className="titlee" id='title'>SPOC LMSC 218</h1>
          <div className="navBar">
            <NavigationBar />
          </div>
          <div className="card-container">
            <div className="ModeDark">
              <DarkmodeButton />
            </div>
            <div className="allClasse">
              <PresentationCard className="card" content={<h1 className='text-3.5xl'>All class</h1>} />
            </div>
            <div className="statistique">
              <PresentationCard className="card" content={<h1 className='text-3.5xl'>Statistique</h1>} />
            </div>
            <div className="sideRightArea">
              <SideRightCard content={<p>test</p>} />
            </div>
            <div className="statForClasse">
              <StatForClasse className="card" content={<h1 className='text-3.5xl'>Statistique for class</h1>} />
            </div>
            <div className="most-done">
              <PresentationCard className="card" content={<h1 className='text-3.5xl text-center'>The most done</h1>} />
            </div>
            <div className="Under600PX">
              <PresentationCard className="card" content={<h1 className='text-3.5xl'>Under 600px</h1>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
