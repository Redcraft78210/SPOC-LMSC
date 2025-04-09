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
import DashboardEleve from "./pages/Eleve/Dashboard";
import DashboardProf from "./pages/Professeur/Dashboard";
import EleveSign from "./pages/Eleve/Sign";
import ProfSign from "./pages/Professeur/Sign"; 

import Logout from "./components/Logout";
import NotFound from "./pages/NotFound";

const routeConfig = [
  { path: "/dashboard", content: "Home" },
  { path: "/profile", content: "Profile" },
  { path: "/courses-library", content: "CoursesLibrary" },
  { path: "/course-reader", content: "CourseReader" },
  
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
  const [isProf, setIsProf] = useState(false);
  const location = useLocation();

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
            setIsProf(decodedToken.role === "professor");
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
      setIsProf(decodedToken.role === "professor");
      localStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setIsProf(false);
    localStorage.removeItem("authToken");
  };

  const DashboardComponent = isProf ? DashboardProf : DashboardEleve;

  const Loader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="animate-pulse text-gray-600">Chargement...</p>
      </div>
    </div>
  );

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
          auth ? (
            <Navigate to="/" replace />
          ) : (
            <EleveSign setAuth={handleSetAuth} />
          )
        }
      />

      <Route
        path="/admin/sign"
        element={
          auth ? (
            <Navigate to="/" replace />
          ) : (
            <ProfSign setAuth={handleSetAuth} />
          )
        }
      />

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
