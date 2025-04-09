import React from "react";
import NavigationBar from "../../components/NavigationBar";
import Logo from "../../Logo";

// import DashboardProf from "./Professeur/DashboardProf";
import DashboardProf from "./DashboardHome";

import Profile from "../Profile";
import NotFound from "../NotFound";
import CoursesLibrary from "../Eleve/CoursesLibrary";
// import Lives from "./Eleve/Lives";
// import LiveManagement from "./Professeur/LiveManagement";

const Dashboard = ({ Content, isProf }) => {
  const renderContent = () => {
    switch (Content) {
      case "Home":
        return <DashboardProf />;
      case "Profile":
        return (
          <div className="profile">
            <div className="profileclass">Profile page</div>
            <Profile />
          </div>
        );
      case "CoursesLibrary":
        return (
          <div className="courses-library">
            <div>Courses Library page</div>
            <CoursesLibrary />
          </div>
        );
      case "Lives":
        return !isProf ? (
          <div className="lives">
            <div>Lives page</div>
            <Lives />
          </div>
        ) : (
          <LiveManagement />
        );
      default:
        return (
          <div className="not-found">
            <div>404 - Page Not Found</div>
            <NotFound />
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container min-vh-90">
      {/* <h1 id="title">SPOC LMSC 218</h1> */}
      <NavigationBar page={Content} />
      <div className="Dcontent container py-3">
        {<Logo fillColor="red" /> && renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
