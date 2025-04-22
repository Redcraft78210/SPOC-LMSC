import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { X, Pencil, User } from "lucide-react";

import NavigationBar from "../../components/Navbar";
// import "../style/NavigationBar.css";

import AdminDashboardHome from "./DashboardHome";
import CourseReader from "./CourseReader";
import CoursesLibrary from "./CoursesLibrary";
import PictureModal from "../../components/PictureModal";
import Profile from "./Profile";
import UserManagement from "./UserManagement";
import NotFound from "../NotFound";
import Logo from "../../Logo";

const DashboardAdmin = ({ content, token }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilepictureModal, setShowProfilepictureModal] = useState(false);
  const divRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    }

    // Ajoutez l'écouteur d'événements quand le menu profil est ouvert
    if (showProfileModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileModal]);

  const decodedToken = jwtDecode(token);

  const user = {
    name: decodedToken.name.charAt(0).toUpperCase() + decodedToken.name.slice(1).toLowerCase(),
    email: decodedToken.email,
    role: decodedToken.role,
  };

  const contentMap = {
    Home: <AdminDashboardHome />,
    Profile: <Profile authToken={token} />,
    CoursesLibrary: <CoursesLibrary authToken={token} />,
    CourseReader: <CourseReader authToken={token} />,
    UserManagement: <UserManagement authToken={token} />,
  };

  const renderContent = () => {
    return contentMap[content] || <NotFound />;
  };

  return showProfilepictureModal ? (
    <PictureModal
      setShowProfilepictureModal={setShowProfilepictureModal}
      user={user}
    />
  ) : (
    <div className="h-screen w-full bg-white flex overflow-hidden">
      <aside className="flex-shrink-0">
        <NavigationBar page={content} isAdmin={true} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-800 flex items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2">
            <Logo fillColor="#F9FAFB" />
          </a>

          <div className="flex items-center gap-4 text-white">
            <div className="flex flex-col items-end">
              <div className="text-md font-medium">{`${user.name}`}</div>
              <div className="text-sm font-regular">Administrateur</div>
            </div>

            <div className="relative flex">
              <button
                className="hover:ring-2 hover:ring-blue-400 rounded-full transition-all"
                onClick={() => setShowProfileModal(true)}
              >
                {/* Votre logo / lettre / image */}
                {!user.avater ||
                user.avatar === "" ||
                user.avatar === "default" ? (
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <img
                    // src={user.avatar}
                    src="https://via.placeholder.com/150"
                    alt="Avatar"
                    className="w-full h-full rounded-full"
                  />
                )}
              </button>
              {showProfileModal && (
                <div
                  className="absolute right-0 mt-13 w-96 bg-white border rounded-xl shadow-lg z-10"
                  ref={divRef}
                >
                  <div
                    className="bg-slate-800 rounded-xl p-6 max-w-full shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <X
                      className="absolute right-1/20 cursor-pointer"
                      onClick={() => setShowProfileModal(false)}
                    />
                    <p className="text-center text-lg text-white mb-6">{`${user.email}`}</p>

                    <div className="text-center mb-4">
                      <p
                        className="relative left-46 top-20 cursor-pointer border border-blue-400 p-1 rounded-full bg-black w-fit"
                        onClick={() => setShowProfilepictureModal(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </p>

                      {/* Votre logo / lettre / image */}
                      {!user.avater ||
                      user.avatar === "" ||
                      user.avatar === "default" ? (
                        <div className="h-20 w-20 rounded-full border-2 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-800">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <img
                          // src={user.avatar}
                          src="https://via.placeholder.com/150"
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                      <p className="text-center text-lg text-xl font-thin text-white mt-1">
                        Bonjour {`${user.name} !`}
                      </p>
                    </div>

                    <a
                      href="/logout"
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center block"
                    >
                      Log Out
                    </a>
                    <div className="flex justify-around mt-4">
                      <p>
                        <a
                          href="/conditions-utisation"
                          className="text-blue-500"
                        >
                          Conditions d'utilisation
                        </a>
                      </p>
                      <p>
                        <a href="/mentions-legales" className="text-blue-500">
                          Mentions légales
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-6 bg-gray-50">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

DashboardAdmin.propTypes = {
  content: PropTypes.oneOf(["Home", "Profile", "CoursesLibrary", "CourseReader", "UserManagement"]).isRequired,
  token: PropTypes.string.isRequired,
};

export default DashboardAdmin;
