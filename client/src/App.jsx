import React, { useState, useEffect } from "react";
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Import your components
import Home from "./pages/Home";
import MaintenanceBanner from "./pages/Maintenance";
import DashboardAdmin from "./pages/Admin/Dashboard";
import DashboardProf from "./pages/Professeur/Dashboard";
import DashboardEleve from "./pages/Eleve/Dashboard";
import Sign from "./pages/Sign";

import Logout from "./components/Logout";
import NotFound from "./pages/NotFound";

// Uncomment the following line to enable maintenance mode
// const APP_STATUS = "MAINTENANCE"; // Set to "MAINTENANCE" for maintenance mode

const routeConfig = [
  { path: "/dashboard", content: "Home" },
  { path: "/profile", content: "Profile" },
  { path: "/courses-library", content: "CoursesLibrary" },
  { path: "/course-reader", content: "CourseReader" },
  { path: "/users-management", content: "UserManagement" },
  { path: "/classes-management", content: "ClassManagement" },
  { path: "/theme-settings", content: "ThemeSettings" },
];

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  // const location = useLocation(); // Non utilisé actuellement

  useEffect(() => {
    if (!auth && !loading && localStorage.getItem("authToken")) {
      handleLogout(); // Ensure the token is removed if auth is false
    }
  }, [auth]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            setAuth(decodedToken);
            setRole(decodedToken.role);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          handleLogout();
        }
      } else {
        setAuth(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSetAuth = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      setAuth(decodedToken);
      setRole(decodedToken.role);
      localStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setRole(null);
    localStorage.removeItem("authToken");
  };

  let DashboardComponent;
  switch (role) {
    case "Professeur":
      DashboardComponent = DashboardProf;
      break;
    case "Administrateur":
      DashboardComponent = DashboardAdmin;
      break;
    default:
      DashboardComponent = DashboardEleve;
  }

  const Loader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="animate-pulse text-gray-600">Chargement...</p>
      </div>
    </div>
  );

  if (typeof APP_STATUS !== "undefined" && APP_STATUS === "MAINTENANCE") {
    return (
      <MaintenanceBanner
        companyName="SPOC LMSC"
        estimatedDuration="2:00 PM - 4:00 PM UTC"
        contactEmail="webmaster@spoc.lmsc"
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          auth ? (
            <DashboardComponent
              content="Home"
              token={localStorage.getItem("authToken")}
            />
          ) : (
            <Home />
          )
        }
      />
      <Route
        path="/sign"
        element={
          auth ? <Navigate to="/" replace /> : <Sign setAuth={handleSetAuth} />
        }
      />
      =
      {auth &&
        routeConfig.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <DashboardComponent
                content={route.content}
                token={localStorage.getItem("authToken")}
              />
            }
          />
        ))}
      {
        !auth && localStorage.getItem("authToken") && handleLogout() // Ensure the token is removed if auth is false
      }
      {!auth &&
        routeConfig.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<Navigate to="/sign" replace />}
          />
        ))}
      <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppWrapper;
