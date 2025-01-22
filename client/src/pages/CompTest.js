import React from 'react'
import DarkmodeButton from '../components/DarkmodeButton';
import TraductionToggle from '../components/TraductionToggle';
import PresentationCard from '../components/PresentationCard';
import ExploreCourses from '../components/ExploreCourses';
import ClassicButton from '../components/ClassicButton';
<<<<<<< HEAD
import NavigationBar from '../components/NavigationBar';
=======
>>>>>>> 4bca485a (Création du Dashboard, pas très optimisé react pour l'instant)

const CompTest = () => {
  return (
    <div>
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