import React from 'react'
import DarkmodeButton from '../components/DarkmodeButton';
import TraductionToggle from '../components/TraductionToggle';
import PresentationCard from '../components/PresentationCard';
import ExploreCourses from '../components/ExploreCourses';
import ClassicButton from '../components/ClassicButton';
import NavigationBar from '../components/NavigationBar';

const CompTest = () => {
  return (
    <div>
      <NavigationBar />
      <br />
      <br />
        <DarkmodeButton />
        <TraductionToggle />
        <PresentationCard content={<p>Test 1,2,23</p>}/>
        <br />
        <ExploreCourses />
        <br />
        <ClassicButton name="Classic Button"  />
    </div>
  )
}

export default CompTest