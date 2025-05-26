import React, { useContext } from 'react'
import LiveClock from './Clock.jsx';

import { ThemeContext } from "../contexts/ThemeContext";
import "./style/DarkmodeButton.module.css";

const DarkmodeButton = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  return (
    <>
      <input
        id="switch"
        className='checkbox'
        type="checkbox"
        onChange={toggleDarkMode}
        checked={darkMode}
      />

            <div className="app mb-4">
                <div className="body">

                    <div className="phone m-auto">
                        <div className="menu">
                            <div className="time"><LiveClock format={'HH:mm:ss'} ticking={true} timezone={'Europe/Paris'} /></div>
                            <div className="icons">
                                <div className="network"></div>
                                <div className="battery"></div>
                            </div>
                        </div>
                        <div className="content">
                            <div className="circle">
                                <div className="crescent"></div>
                            </div>
                            <label className="label" htmlFor="switch">
                                <div className="toggle"></div>
                                <div className="names">
                                    <p className="light">Light</p>
                                    <p className="dark">Dark</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DarkmodeButton;
