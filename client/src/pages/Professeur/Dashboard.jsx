import React from "react";
import NavigationBar from "../../components/NavigationBar";
import Logo from "../../Logo";
import PropTypes from "prop-types";

// import DashboardProf from "./Professeur/DashboardProf";
import DashboardHome from "./DashboardHome";

import Profile from "../Profile";
import NotFound from "../NotFound";
import CoursesLibrary from "../Admin/CoursesLibrary";
// import Lives from "./Eleve/Lives";
// import LiveManagement from "./Professeur/LiveManagement";

const DashboardProf = ({ Content, token }) => {
  const renderContent = () => {
    switch (Content) {
      case "Home":
        return <DashboardHome />;
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
        <div className="lives">
          <div>Lives page</div>
          <Lives />
        </div>;
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

DashboardProf.propTypes = {
  content: PropTypes.oneOf([
    "Home",
    "Profile",
    "CoursesLibrary",
    "CourseReader",
    "UserManagement",
  ]).isRequired,
  token: PropTypes.string.isRequired,
};

export default DashboardProf;
