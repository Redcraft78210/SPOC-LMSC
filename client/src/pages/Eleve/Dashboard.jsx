import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import { X, Pencil, Loader2 } from 'lucide-react';

import NavigationBar from '../../components/Navbar';
// import "../style/NavigationBar.css";

import NotFound from '../Public/NotFound';
import CoursesLibrary from '../Eleve/CoursesLibrary';
import CourseReader from '../Eleve/CourseReader';
import LiveViewer from './LiveViewer';
import Forum from './pages/Forum';
import EleveDashboardHome from './DashboardHome';
import PictureModal from '../../components/PictureModal';
import ThemeSettings from '../Public/Theme';
import Settings from '../Settings';
import Logo from '../../Logo';

const API_URL = 'https://localhost:8443/api';

const DashboardEleve = ({ content, token }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilepictureModal, setShowProfilepictureModal] = useState(false);
  const divRef = useRef();
  const [userAvatar, setUserAvatar] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Fonction pour rafraîchir l'avatar
  const refreshAvatar = useCallback(() => {
    // Force a re-fetch of the avatar by updating the version with the current timestamp
    setAvatarVersion(Date.now());
  }, []);

  // Récupération de l'avatar avec fetch
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setLoadingAvatar(true);

        // Clear previous avatar URL to prevent showing stale images
        if (userAvatar) {
          URL.revokeObjectURL(userAvatar);
          setUserAvatar(null);
        }

        const response = await fetch(`${API_URL}/avatars?t=${avatarVersion}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Disable cache to ensure fresh avatar
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setUserAvatar(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setUserAvatar(null);
      } finally {
        setLoadingAvatar(false);
      }
    };

    fetchAvatar();

    // Nettoie l'URL de l'objet lorsque le composant est démonté
    return () => {
      if (userAvatar) {
        URL.revokeObjectURL(userAvatar);
      }
    };
  }, [token, avatarVersion]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    }

    // Ajoutez l'écouteur d'événements quand le menu profil est ouvert
    if (showProfileModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal]);

  const decodedToken = jwtDecode(token);

  const user = {
    name:
      decodedToken.name.charAt(0).toUpperCase() +
      decodedToken.name.slice(1).toLowerCase(),
    email: decodedToken.email,
    role: decodedToken.role,
  };

  const contentMap = {
    CourseReader: <CourseReader authToken={token} />,
    CoursesLibrary: <CoursesLibrary authToken={token} />,
    LiveViewer: <LiveViewer authToken={token} />,
    Forum: <Forum authToken={token} />,
    Home: <EleveDashboardHome authToken={token} />,
    Settings: (
      <Settings
        authToken={token}
        refreshAvatar={refreshAvatar}
        userAvatar={userAvatar}
        loadingAvatar={loadingAvatar}
      />
    ),
    ThemeSettings: <ThemeSettings />,
  };

  const renderContent = () => {
    return contentMap[content] || <NotFound />;
  };

  // Pour le PictureModal, vous transmettez déjà les bonnes props
  return showProfilepictureModal ? (
    <PictureModal
      setShowProfilepictureModal={setShowProfilepictureModal}
      refreshAvatar={refreshAvatar}
      authToken={token}
    />
  ) : (
    <div className="h-screen w-full bg-white flex overflow-hidden">
      <aside className="flex-shrink-0">
        <NavigationBar page={content} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-800 flex items-center justify-between px-6">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              navigate('/');
            }}
            className="flex items-center gap-2"
          >
            <Logo fillColor="#F9FAFB" />
          </a>

          <div className="flex items-center gap-4 text-white">
            <div className="flex flex-col items-end">
              <div className="text-md font-medium">{`${user.name}`}</div>
              <div className="text-sm font-regular">Student</div>
            </div>

            <div className="relative flex">
              <button
                className="hover:ring-2 hover:ring-blue-400 rounded-full transition-all"
                onClick={() => setShowProfileModal(true)}
              >
                {loadingAvatar ? (
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                ) : !userAvatar ? (
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setUserAvatar(null)}
                  />
                )}
              </button>
              {showProfileModal && (
                <div
                  className="absolute right-0 mt-13 w-96 bg-white border rounded-xl shadow-lg z-1000"
                  ref={divRef}
                >
                  <div
                    className="bg-slate-800 rounded-xl p-6 max-w-full shadow-xl"
                    onClick={e => e.stopPropagation()}
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

                      {loadingAvatar ? (
                        <div className="h-20 w-20 rounded-full border-2 bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                      ) : !userAvatar ? (
                        <div className="h-20 w-20 rounded-full border-2 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-800">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={userAvatar}
                          alt="Avatar"
                          className="h-20 w-20 rounded-full mx-auto mb-4 object-cover"
                          onError={() => setUserAvatar(null)}
                        />
                      )}
                      <p className="text-center text-lg text-xl font-thin text-white mt-1">
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
                      Log Out
                    </a>
                    <div className="flex justify-around mt-4">
                      <p>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            navigate('/conditions-utilisation');
                          }}
                          className="text-blue-500"
                        >
                          Conditions d&apos;utilisation
                        </a>
                      </p>
                      <p>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            navigate('/mentions-legales');
                          }}
                          className="text-blue-500"
                        >
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

DashboardEleve.propTypes = {
  content: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
};

export default DashboardEleve;
