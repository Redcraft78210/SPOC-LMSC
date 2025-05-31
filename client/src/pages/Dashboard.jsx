import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatar } from '../API/ProfileCaller';
import { jwtDecode } from 'jwt-decode';
import { X, Pencil, Loader2, Mail, Bell, Menu } from 'lucide-react';
import PropTypes from 'prop-types';

import NavigationBar from '../components/Navbar';
import Logo from '../Logo';

// Lazy load components
const PictureModal = lazy(() => import('../components/PictureModal'));
const AdminDashboardHome = lazy(() => import('./Admin/DashboardHome'));
const ProfDashboardHome = lazy(() => import('./Professeur/DashboardHome'));
const EleveDashboardHome = lazy(() => import('./Eleve/DashboardHome'));
const ProfCoursesLibrary = lazy(() => import('./Professeur/CoursesLibrary'));
const AdminCoursesLibrary = lazy(() => import('./Admin/CoursesLibrary'));
const CoursesLibrary = lazy(() => import('./Eleve/CoursesLibrary'));
const CoursesManagement = lazy(() => import('../components/ProfComp/CoursesManagment'));
const DocumentManager = lazy(() => import('../components/ProfComp/DocumentMng'));
const VideoManager = lazy(() => import('../components/ProfComp/VideoMng'));
const VideoRecording = lazy(() => import('../components/ProfComp/Recording'));
const CourseReader = lazy(() => import('./CourseReader'));
const LiveViewer = lazy(() => import('./Eleve/LiveViewer'));
const Forum = lazy(() => import('./Forum'));
const UserManagement = lazy(() => import('./Admin/UserManagement'));
const ClassManagement = lazy(() => import('./Admin/ClassManagement'));
const ThemeSettings = lazy(() => import('./Public/Theme'));
const Settings = lazy(() => import('./Settings'));
const NotFound = lazy(() => import('./Public/NotFound'));
const Mailbox = lazy(() => import('./Mailbox'));

// Add a loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const Dashboard = ({ content, token, role }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilepictureModal, setShowProfilepictureModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const divRef = useRef();
  const [userAvatar, setUserAvatar] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const avatarUrlRef = useRef(null);

  // Fonction pour rafraîchir l'avatar
  const refreshAvatar = useCallback(() => {
    setAvatarVersion(Date.now());
  }, []);

  // Récupération de l'avatar
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setLoadingAvatar(true);
        if (avatarUrlRef.current) {
          URL.revokeObjectURL(avatarUrlRef.current);
        }

        const response = await getAvatar();

        if (response.status === 200) {
          const imageUrl = URL.createObjectURL(response.data);
          avatarUrlRef.current = imageUrl;
          setUserAvatar(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setUserAvatar(null);
      } finally {
        setLoadingAvatar(false);
      }
    };

    fetchAvatar();

    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
    };
  }, [token, avatarVersion]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    }

    if (showProfileModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal]);

  // Fermer le menu mobile quand le contenu change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [content]);

  const decodedToken = jwtDecode(token);

  const user = {
    name:
      decodedToken.name.charAt(0).toUpperCase() +
      decodedToken.name.slice(1).toLowerCase(),
    email: decodedToken.email,
    role: decodedToken.role,
  };

  const contentMap = {
    Home: user.role === 'Admin' ? (
      <Suspense fallback={<LoadingComponent />}>
        <AdminDashboardHome />
      </Suspense>
    ) : user.role === 'Professeur' ? (
      <Suspense fallback={<LoadingComponent />}>
        <ProfDashboardHome authToken={token} />
      </Suspense>
    ) : (
      <Suspense fallback={<LoadingComponent />}>
        <EleveDashboardHome authToken={token} />
      </Suspense>
    ),
    CoursesLibrary: <CoursesLibrary authToken={token} />,
    CourseReader: <CourseReader authToken={token} />,
    ...(user.role === 'Administrateur'
      ? {
        Home: <AdminDashboardHome authToken={token} />,
        CoursesLibrary: <AdminCoursesLibrary authToken={token} />,
      }
      : {}),
    ...(user.role === 'Administrateur' || user.role === 'Professeur'
      ? {
        UserManagement: <UserManagement authToken={token} />,
        ClassManagement: <ClassManagement authToken={token} />,
      }
      : {}),
    ...(user.role === 'Professeur'
      ? {
        Home: <ProfDashboardHome authToken={token} />,
        CoursesLibrary: <ProfCoursesLibrary authToken={token} />,
        CoursesManagement: <CoursesManagement authToken={token} />,
        VideoManager: <VideoManager authToken={token} />,
        VideoRecording: <VideoRecording authToken={token} />,
        DocumentManager: <DocumentManager authToken={token} />,
      }
      : {}),
    ...(user.role === 'Etudiant'
      ? {
        Home: <EleveDashboardHome authToken={token} />,
        CoursesLibrary: <CoursesLibrary authToken={token} />,
        CourseReader: <CourseReader authToken={token} />,
      }
      : {}),
    ThemeSettings: <ThemeSettings />,
    Forum: <Forum authToken={token} />,
    LiveViewer: <LiveViewer authToken={token} />,
    Settings: (
      <Settings
        authToken={token}
        refreshAvatar={refreshAvatar}
        userAvatar={userAvatar}
        loadingAvatar={loadingAvatar}
      />
    ),
  };

  const renderContent = () => {
    return contentMap[content] || <NotFound />;
  };

  return showProfilepictureModal ? (
    <PictureModal
      setShowProfilepictureModal={setShowProfilepictureModal}
      refreshAvatar={refreshAvatar}
      authToken={token}
    />
  ) : (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/10 z-30 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <NavigationBar
          page={content}
          isAdmin={role === 'Administrateur'}
          isProf={role === 'Professeur'}
        />
      </aside>

      {showMailModal && (
        <Mailbox
          user={user}
          role={role}
          onClose={() => {
            setShowMailModal(false);
          }}
          authToken={token}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-gray-800 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <button
              className="md:hidden mr-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex items-center gap-2"
            >
              <Logo fillColor="#F9FAFB" className="h-15 w-auto sm:h-8 md:h-15 lg:h-20 transition-all" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 text-white">
              <Bell className="h-5 w-5 md:h-6 md:w-6 mx-1" />
              <Mail
                className="h-5 w-5 md:h-6 md:w-6 mx-1 md:mx-3 cursor-pointer"
                onClick={() => setShowMailModal(true)}
              />
              <div className="hidden md:flex flex-col items-end">
                <div className="text-md font-medium">{`${user.name}`}</div>
                <div className="text-sm font-regular">{role}</div>
              </div>
            </div>

            <div className="relative flex">
              <button
                className="hover:ring-2 hover:ring-blue-400 rounded-full transition-all"
                onClick={() => setShowProfileModal(true)}
              >
                {loadingAvatar ? (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-blue-500 animate-spin" />
                  </div>
                ) : !userAvatar ? (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-gray-800">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                    onError={() => setUserAvatar(null)}
                  />
                )}
              </button>
              {showProfileModal && (
                <div
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-[360px] bg-white border rounded-xl shadow-lg z-50"
                  ref={divRef}
                >
                  <div
                    className="bg-slate-800 rounded-xl p-4 md:p-6 shadow-xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <X
                      className="absolute right-3 top-3 cursor-pointer text-white"
                      onClick={() => setShowProfileModal(false)}
                    />
                    <p className="text-center text-white mb-4 md:mb-6 text-sm md:text-base truncate">{`${user.email}`}</p>

                    <div className="text-center mb-4 relative">
                      {/* Profile picture container */}
                      <div className="relative inline-block mx-auto">
                        {loadingAvatar ? (
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-spin" />
                          </div>
                        ) : !userAvatar ? (
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-xl md:text-2xl font-bold text-gray-800">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={userAvatar}
                            alt="Avatar"
                            className="h-16 w-16 md:h-20 md:w-20 rounded-full mx-auto mb-4 object-cover"
                            onError={() => setUserAvatar(null)}
                          />
                        )}

                        {/* Edit button positioned absolutely over the image */}
                        <button
                          className="absolute -right-2 top-0 cursor-pointer border border-blue-400 p-1 rounded-full bg-black"
                          onClick={() => setShowProfilepictureModal(true)}
                        >
                          <Pencil className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                        </button>
                      </div>

                      <p className="text-center text-white mt-1 text-lg md:text-xl">
                        Bonjour {`${user.name} !`}
                      </p>
                    </div>

                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        navigate('/logout');
                      }}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center block"
                    >
                      Déconnexion
                    </a>
                    <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm md:text-base">
                      <p>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            navigate('/terms');
                          }}
                          className="text-blue-400 hover:underline"
                        >
                          Conditions
                        </a>
                      </p>
                      <p>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            navigate('/legal');
                          }}
                          className="text-blue-400 hover:underline"
                        >
                          Mentions légales
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 -webkit-overflow-scrolling-touch">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

Dashboard.propTypes = {
  content: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['Administrateur', 'Professeur', 'Etudiant']).isRequired,
};

export default Dashboard;