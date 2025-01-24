import React from 'react';
import './styles/Dashboard.css';
import NavigationBar from '../components/NavigationBar';

import Home from './Home';
import Profile from './Profile';
import NotFound from './NotFound';
import CompTest from './CompTest';
import CoursesLibrary from './CoursesLibrary';

const Dashboard = ({ Content }) => {
  const renderContent = () => {
    switch (Content) {
      case "Home":
        return (
          <Home></Home>
        );
      case "Profile":
        return (
          <div className="profile">
            <div className="profileclass">Profile page</div>
            <Profile></Profile>
          </div>
        );
      case "CompTest":
        return (
          <div className="comp-test">
            <div>Component Test page</div>
            <CompTest></CompTest>
          </div>
        );
      case "CoursesLibrary":
        return (
          <div className="courses-library">
            <div>Courses Library page</div>
            <CoursesLibrary></CoursesLibrary>
          </div>
        );
      default:
        return (
          <div className="not-found">
            <div>404 - Page Not Found</div>
            <NotFound></NotFound>
          </div>
        );
    }
  };

  return (
    <div className="container">
      <div className="dashboard-container">
        <h1 id="title">SPOC LMSC 218</h1>
        <div className="navBar">
          <NavigationBar />
        </div>
        <div className="Dcontent">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
