import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FileText, SquarePlay, Radio, ShieldEllipsis } from 'lucide-react'; // Ajout de ShieldEllipsis
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../API/CourseCaller';
import { getAllLives } from '../../API/LiveCaller';

const Courses = ({ authToken, userRole }) => {
  const [selectedProfessor, setSelectedProfessor] = useState('Tous');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_recent');
  const [selectedType, setSelectedType] = useState('Tous');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('userRole:', userRole); // Debugging line to check userRole

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('lives') !== null
      ? 'Live'
      : params.get('courses') !== null
        ? 'Cours'
        : 'Tous';
    setSelectedType(typeParam);
  }, [window.location.search]);

  // Récupération des données depuis les APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [coursesResponse, livesResponse] = await Promise.all([
          getAllCourses(),
          getAllLives()
        ]);

        if (coursesResponse.status !== 200) {
          throw new Error('Failed to fetch courses: ' + coursesResponse.message);
        }

        if (livesResponse.status !== 200) {
          throw new Error('Failed to fetch lives: ' + livesResponse.message);
        }

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
                  topic,
                  type,
                });
              }
            }
          }
          return result;
        };

        setContent([
          ...transformData(coursesResponse.data, 'cours'),
          ...transformData(livesResponse.data, 'live'),
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
        if (item.type === 'cours') {
          return item.date_creation;
        } else if (item.type === 'live' && item.live) {
          return item.live.date_debut;
        }
        return null;
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
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header>
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
              <ContentCard key={item.id} item={item} userRole={userRole} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContentCard = ({ item, userRole }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);
  const hoverTimeout = useRef(null);
  const menuRef = useRef(null);

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
    if (item.type === 'live') {
      navigate('/liveViewer?liveid=' + item.id);
    } else {
      navigate('/course-reader?courseId=' + item.id);
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowModMenu((prev) => !prev);
  };

  const handleModAction = (action, e) => {
    e.stopPropagation();
    setShowModMenu(false);
    if (action === 'edit') {
      if (item.type === 'live') {
        navigate(`/admin/edit-live/${item.id}`);
      } else {
        navigate(`/admin/edit-course/${item.id}`);
      }
    } else if (action === 'delete') {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.titre}" ?`)) {
        // Logique de suppression à implémenter ici
        alert('Suppression non implémentée');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowModMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  const formatDuration = seconds => {
    if (isNaN(seconds) || seconds < 0) {
      return 'NaN';
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : '00',
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ].join(':');
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Bouton de modération pour les administrateurs */}
      {userRole === 'Administrateur' && (
        <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
          <button
            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
            onClick={handleMenuToggle}
          >
            <ShieldEllipsis className="h-5 w-5 text-gray-600" />
          </button>
          {showModMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-20"
            >
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={e => handleModAction('edit', e)}
              >
                Modifier
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={e => handleModAction('delete', e)}
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="aspect-video bg-gray-200 relative">
          {item.type === 'cours' && item.video ? (
            !item.video.cover_image && item.video.preview_image !== null ? (
              <>
                {isHovered ? (
                  <img
                    className="w-full h-full object-cover"
                    src={`data:image/webp;base64,${item.video.preview_image}`}
                    alt={item.titre}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    src={`data:image/png;base64,${item.video.cover_image}`}
                    alt={item.titre}
                  />
                )}
              </>
            ) : item.video && item.video.cover_image ? (
              <img
                className="w-full h-full object-cover"
                src={`data:image/png;base64,${item.video.cover_image}`}
                alt={item.titre}
              />
            ) : (
              <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center">
                <SquarePlay className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Cours Video</p>
              </div>
            )
          ) : item.type === 'cours' && item.nombre_de_documents > 0 ? (
            <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center">
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Documents disponibles</p>
              <span className="text-xs text-gray-500">
                {item.nombre_de_documents} document(s)
              </span>
            </div>
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

        <div className="p-4 relative h-full flex flex-col justify-between">
          <div className="flex justify-between mb-2">
            <div className="flex items-start space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {item.titre}
              </h2>
              {item.type === 'cours' && item.video && (
                <div className="text-xs ml-2">
                  <div className="flex items-center">
                    <SquarePlay className="w-4 h-4 mr-2" />
                    <span className="text-xs text-gray-500">
                      {item.video.duration !== null
                        ? formatDuration(parseInt(item.video.duration, 10))
                        : 'N/A'}
                    </span>
                  </div>
                  {item.nombre_de_documents > 0 && (
                    <div className="flex items-center mt-2">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="text-xs text-gray-500 text-nowrap">
                        {item.nombre_de_documents} document(s)
                      </span>
                    </div>
                  )}
                </div>
              )}
              {item.type === 'live' && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs text-nowrap">
                  En direct à{' '}
                  {new Date(item.live.date_debut).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>

          <div
            className={`flex items-center justify-between text-sm text-gray-500 mt-auto pt-4`}
          >
            <span className="font-medium truncate">{item.professor}</span>
            <span className="italic">
              {item.type === 'cours'
                ? item.date_creation &&
                new Date(item.date_creation).toLocaleDateString('fr-FR')
                : item.live &&
                new Date(item.live.date_debut).toLocaleDateString('fr-FR')}
            </span>
          </div>
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
    date_creation: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['cours', 'live']).isRequired,
    live: PropTypes.shape({
      date_debut: PropTypes.string,
      statut: PropTypes.string,
    }),
    description: PropTypes.string,
    video: PropTypes.shape({
      id: PropTypes.string,
      duration: PropTypes.string,
      cover_image: PropTypes.string,
      preview_image: PropTypes.string,
      fingerprint: PropTypes.string,
    }),
    nombre_de_documents: PropTypes.number,
    professor: PropTypes.string.isRequired,
    subject: PropTypes.string,
  }).isRequired,
  userRole: PropTypes.string, // Ajout de la prop userRole
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
  userRole: PropTypes.string, // Ajout de la prop userRole
};

export default Courses;
