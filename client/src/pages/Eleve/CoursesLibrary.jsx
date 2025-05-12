import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { FileText, SquarePlay, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://localhost:8443/api';

const Courses = ({ authToken }) => {
  const [selectedProfessor, setSelectedProfessor] = useState('Tous');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_recent');
  const [selectedType, setSelectedType] = useState('Tous');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données depuis les APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mock API calls
        // const fetchCourses = async () => ({
        //   'Mr grandingo': {
        //     math_info: {
        //       complexe: {
        //         titre: 'Nombres imaginaires',
        //         description: 'Introduction aux nombres imaginaires',
        //         date_creation: '2025-03-17T18:52:02.826Z',
        //         id: '7f4b5385-04fa-cde3-c881-b73844f52f25',
        //         type: 'cours',
        //         video: {
        //           video_id: '3f4b538504facde3c881b73844f52f24-1742237522',
        //           date_mise_en_ligne: '2024-03-17T18:52:48.781Z',
        //         },
        //         nombre_de_documents: 4,
        //       },
        //     },
        //   },
        // });

        // const fetchLives = async () => ({
        //   'Mme claquette': {
        //     physique: {
        //       asservissement: {
        //         titre: 'Live Pont diviseur',
        //         description: 'Session en direct sur le pont diviseur',
        //         date_creation: '2025-03-17T18:52:02.826Z',
        //         id: 'a6fa5fc1-1234-4321-0000-000000000015',
        //         type: 'live',
        //         live: {
        //           date_debut: '2024-06-18T14:30:00.000Z',
        //           statut: 'programme',
        //         },
        //       },
        //     },
        //   },
        // });

        // Fetch courses from the API
        const fetchCourses = async () => {
          const response = await fetch(`${API_URL}/courses/all`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch courses');
          }
          return await response.json();
        };

        // Fetch lives from the API
        const fetchLives = async () => {
          const response = await fetch(`${API_URL}/lives/all`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch lives');
          }
          return await response.json();
        };

        const [coursesData, livesData] = await Promise.all([
          fetchCourses(),
          fetchLives(),
        ]);
        // Transformation des données en tableau plat
        const transformData = (data, type) => {
          if (!data || typeof data !== 'object') {
            console.error(`Invalid data passed to transformData:`, data);
            return [];
          }

          const result = [];
          for (const [professor, subjects] of Object.entries(data)) {
            for (const [subject, topics] of Object.entries(subjects)) {
              for (const [topic, details] of Object.entries(topics)) {
                result.push({
                  ...details,
                  professor,
                  subject,
                  titre: details.titre || topic, // Add topic as titre if titre is not present
                  type,
                });
              }
            }
          }
          return result;
        };

        setContent([
          ...transformData(coursesData, 'cours'),
          ...transformData(livesData, 'live'),
        ]);

        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  // Filtrage et tri
  const filteredContent = content
    .filter(item => {
      const matchesType =
        selectedType === 'Tous' || item.type === selectedType.toLowerCase();
      const matchesProfessor =
        selectedProfessor === 'Tous' || item.professor === selectedProfessor;
      const matchesSubject =
        selectedSubject === 'Tous' || item.subject === selectedSubject;
      const matchesSearch =
        item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesProfessor && matchesSubject && matchesSearch;
    })
    .sort((a, b) => {
      const getDate = item => {
        if (item.type === 'cours' && item.video) {
          return item.video.date_mise_en_ligne;
        } else if (item.type === 'live' && item.live) {
          return item.live.date_debut;
        }
        return null; // Fallback if no date is available
      };

      return sortBy === 'date_recent'
        ? new Date(getDate(b)) - new Date(getDate(a))
        : new Date(getDate(a)) - new Date(getDate(b));
    });

  // Récupère les filtres uniques
  const professors = [...new Set(content.map(item => item.professor))];
  const subjects = [...new Set(content.map(item => item.subject))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Erreur ! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bibliothèque de Cours
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Barre de recherche et filtres */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="mb-4">
            <label className="sr-only" htmlFor="search">
              Rechercher
            </label>
            <div className="relative">
              <svg
                width="20"
                height="20"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16a6 6 0 1111.31 2.16l4.73 4.73a1 1 0 01-1.42 1.42l-4.73-4.73A6 6 0 018 16z"
                />
              </svg>
              <input
                id="search"
                type="text"
                placeholder="Rechercher des cours..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Type de contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de contenu
              </label>
              <FilterDropdown
                items={['Tous', 'Cours', 'Live']}
                selected={selectedType}
                setSelected={setSelectedType}
              />
            </div>
            {/* Professeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professeur
              </label>
              <FilterDropdown
                items={['Tous', ...professors]}
                selected={selectedProfessor}
                setSelected={setSelectedProfessor}
              />
            </div>
            {/* Matière */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matière
              </label>
              <FilterDropdown
                items={['Tous', ...subjects]}
                selected={selectedSubject}
                setSelected={setSelectedSubject}
              />
            </div>
            {/* Trier par */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date_recent">Plus récent</option>
                <option value="date_ancien">Plus ancien</option>
              </select>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucun contenu trouvé avec ces critères.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContentCard = ({ item }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  const handleClick = () => {
    // Utilisation de l'id au lieu de id_cours pour correspondre aux données
    if (item.type === 'live') {
      navigate('/liveViewer?liveid=' + item.id);
    } else {
      navigate('/course-reader?courseId=' + item.id);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="aspect-video bg-gray-200 relative">
        {item.type === 'cours' && item.video ? (
          <>
            {isHovered ? (
              <img
                className="w-full h-full object-cover"
                src={`/videos/${item.video.video_id}/${item.video.video_id}.preview.webp`}
                alt={item.titre}
                style={{ display: 'block' }}
              />
            ) : (
              <img
                className="w-full h-full object-cover"
                src={`/videos/${item.video.video_id}/0.png`}
                alt={item.titre}
                style={{ display: 'block' }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">
                Live programmé
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.live && item.live.date_debut ? (
                  new Date(item.live.date_debut).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                ) : (
                  <span className="text-gray-500">Date non disponible</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 relative">
        <div className="flex flex-col items-end gap-2 absolute right-2 top-2">
          {item.type === 'cours' && (
            <>
              <div className="flex items-center">
                <SquarePlay className="w-4 h-4 mr-2" />
                <span className="text-xs text-gray-500">00:27:30</span>
              </div>
              {item.nombre_de_documents && item.nombre_de_documents > 0 && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-xs text-gray-500">
                    {item.nombre_de_documents} document(s)
                  </span>
                </div>
              )}
            </>
          )}
          {item.type === 'live' && (
            <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
              En direct à{' '}
              {new Date(item.live.date_debut).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {item.titre}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span className="font-medium">{item.professor}</span>
          <span className="italic">
            {item.type === 'cours'
              ? item.video &&
                new Date(item.video.date_creation).toLocaleDateString('fr-FR')
              : item.live &&
                new Date(item.live.date_debut).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
};

// PropTypes définis à l'extérieur du composant
ContentCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired, // Changé de id_cours à id
    titre: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['cours', 'live']).isRequired,
    live: PropTypes.shape({
      date_debut: PropTypes.string,
      statut: PropTypes.string,
    }),
    description: PropTypes.string,
    video: PropTypes.shape({
      video_id: PropTypes.string,
      date_creation: PropTypes.string,
    }),
    nombre_de_documents: PropTypes.number,
    professor: PropTypes.string.isRequired,
    subject: PropTypes.string,
  }).isRequired,
};

// Composant de filtre déroulant
const FilterDropdown = ({ items, selected, setSelected }) => (
  <select
    className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    value={selected}
    onChange={e => setSelected(e.target.value)}
  >
    {items.map(item => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>
);

FilterDropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

Courses.propTypes = {
  authToken: PropTypes.string.isRequired,
};
export default Courses;
