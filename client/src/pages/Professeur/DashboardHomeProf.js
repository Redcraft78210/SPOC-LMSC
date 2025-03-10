import React from 'react';
// import { useNavigate } from 'react-router-dom';

import PresentationCard from '../../components/PresentationCard';
import NotificationCard from '../../components/NotificationCard';
// import TraductionToggle from '../components/TraductionToggle';
import DarkmodeButton from '../../components/DarkmodeButton';
import OnAir from '../../components/OnAir';


function DashboardHomeProf() {
  // const navigate = useNavigate();
  return (
    <div className="d-flex flex-wrap">
      <div className="row col-10 col-md-8 col-lg-9">
        {/* Dark Mode Button */}
        <div className="col-12 col-md-6 col-lg-3 m-auto mb-4 ModeDark">
          <DarkmodeButton 
            
          />
        </div>

        {/* All Class Card */}
        <div className="col-12 col-md-6 col-lg-4 mb-4 allClasse">
          <PresentationCard
            className="card"
            content={<h1 className="text-3.5xl">All class</h1>}
          />
        </div>

        {/* Statistique Card */}
        <div className="col-12 col-md-7 col-lg-4 mb-4 statistique">
          <PresentationCard
            className="card"
            content={<OnAir title="Statistique" />}
          />
        </div>

        {/* Statistique for Class Card */}
        <div className="col-12 col-md-7 col-lg-4 mb-4 statForClasse">
          <PresentationCard
            className="card"
            content={<h1 className="text-3.5xl">Statistique for class</h1>}
          />
        </div>

        {/* Placeholder Card */}
        <div className="col-12 col-md-7 col-lg-4 mb-4 statForClasse">
          <PresentationCard
            className="card"
            content={<h1 className="text-3.5xl">PLACEHOLDER</h1>}
          />
        </div>

        {/* Most Done Card */}
        <div className="col-12 col-md-7 col-lg-4 mb-4 most-done">
          <PresentationCard
            className="card"
            content={<h1 className="text-3.5xl text-center">The most done</h1>}
          />
        </div>
      </div>

      {/* Notification Card */}
      <div className="row col-2 col-md-6 col-lg-3">
        <NotificationCard content={<p>PLACEHOLDER</p>} />
      </div>
    </div>
  );
}

export default DashboardHomeProf;
