import './style/NavigationBar.css'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { AlignJustify, AppWindow, Cog, House, LibraryBig, UserRoundCog } from 'lucide-react'
import is from '../../node_modules/typescript/lib/typescriptServices';

const NavigationBar = () => {
    const navigate = useNavigate();
    const page = window.location.href;
    const [isActive, setIsActive] = React.useState(true);
    const [isDashboardActive, setIsDashboardActive] = React.useState(false);
    const [isProfileActive, setIsProfileActive] = React.useState(false);
    const [isCoursesLibraryActive, setIsCoursesLibraryActive] = React.useState(false);

    useEffect(() => {
        if (page.includes('/dashboard')) {
            setIsDashboardActive(true);
        } else {
            setIsDashboardActive(false);
        }
        if (page.includes('/profile')) {
            setIsProfileActive(true);
        } else {
            setIsProfileActive(false);
        }
        if (page.includes('/courses-library')) {
            setIsCoursesLibraryActive(true);
        } else {
            setIsCoursesLibraryActive(false);
        }
    }, [page]);

    const handleNavigate = (path) => {
        return () => navigate(path);
    }

  return (
    <div>
        <div className='NavigationBar-container'>
            <a id="toggle" onClick={(event)=> {
                    event.preventDefault();
                    setIsActive(!isActive)
                }} href=""><AlignJustify /></a>
            {isActive && (
            <ul>
                <li><a onClick={handleNavigate('/')} href=""><House /></a></li>
                {!isDashboardActive && (<li><a onClick={handleNavigate('/dashboard')} href=""><AppWindow /></a></li>)}
                {!isCoursesLibraryActive && (<li><a onClick={handleNavigate('/courses-library')} href=""><LibraryBig /></a></li>)}
                {!isProfileActive && (<li><a onClick={handleNavigate('/profile')} href=""><UserRoundCog /></a></li>)}
            </ul>)}
        </div>
    </div>
    
  )
}

export default NavigationBar