import React from 'react';
import { useNavigate } from 'react-router-dom';
import PresentationCard from '../components/PresentationCard';
import SideRightCard from '../components/SideRightCard';
import TraductionToggle from '../components/TraductionToggle';
import DarkmodeButton from '../components/DarkmodeButton';


function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className='text-4xl'>Welcome to SPOC</h1>
      <p>Start your learning journey today with our courses!</p>
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
          <PresentationCard className="card" content={<h1 className='text-3.5xl'>Statistique for class</h1>} />
        </div>
        <div className="most-done">
          <PresentationCard className="card" content={<h1 className='text-3.5xl text-center'>The most done</h1>} />
        </div>
      </div>
    </div>
  );
}

export default Home;
