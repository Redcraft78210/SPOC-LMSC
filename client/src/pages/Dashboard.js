import React from 'react';
import './styles/Dashboard.css';
import NavigationBar from '../components/NavigationBar';


import DashboardHome from './DashboardHome';
import Profile from './Profile';
import NotFound from './NotFound';
import CoursesLibrary from './CoursesLibrary';

const Dashboard = ({ Content }) => {
  const renderContent = () => {
    switch (Content) {
      case "Home":
        return (
          <DashboardHome/>
        );
      case "Profile":
        return (
          <div className="profile">
            <div className="profileclass">Profile page</div>
            <Profile/>
          </div>
        );
      case "CoursesLibrary":
        return (
          <div className="courses-library">
            <div>Courses Library page</div>
            <CoursesLibrary/>
          </div>
        );
      default:
        return (
          <div className="not-found">
            <div>404 - Page Not Found</div>
            <NotFound/>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container min-vh-90">
      <h1 id="title">SPOC LMSC 218</h1>
      <NavigationBar page={Content} />
      <div className="Dcontent container py-3">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
