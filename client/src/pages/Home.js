import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactDOM } from 'react-dom/client';
import { Button } from 'react-bootstrap';

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className='text-4xl'>Welcome to SPOC</h1>
      <p>Start your learning journey today with our courses!</p>
      <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
    </div>
  );
}

export default Home;
