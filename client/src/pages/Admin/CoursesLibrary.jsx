import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, SquarePlay, Settings2 } from 'lucide-react';
import PropTypes from 'prop-types';

const Courses = () => {
  const [selectedProfessor, setSelectedProfessor] = useState('Tous');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_recent');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données depuis l'API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // const response = await axios.get('/api/courses');
        // const apiData = response.data;
        const apiData = {
          'Mr grandingo': {
            math_info: {
              complexe: {
                titre: 'Nombres imaginaires',
                description: 'Introduction aux nombres imaginaires',
                date_creation: '2025-03-17T18:52:02.826Z',
                id_cours: '7f4b538504facde3c881b73844f52f24',
                video: {
                  video_id: '3f4b538504facde3c881b73844f52f24-1742237522', // à retirer dès que possible
                  chemin_fichier:
                    'videos/3f4b538504facde3c881b73844f52f24-1742237522.mp4',
                  date_mise_en_ligne: '2024-03-17T18:52:48.781Z',
                },
                nombre_de_documents: 4,
              },
            },
          },
          'Mme claquette': {
            physique: {
              asservissement: {
                titre: 'Pont diviseur de tension',
                description: 'Cours sur le pont diviseur de tension',
                date_creation: '2025-03-17T18:52:02.826Z',
                id_cours: '7f4b538504facde3c881b73844f52f25',
                video: {
                  video_id: '5f4b538504facde3c881b73844f52f24-1742237522',
                  chemin_fichier:
                    'videos/5f4b538504facde3c881b73844f52f24-1742237522.mp4',
                  date_mise_en_ligne: '2024-06-17T18:52:48.781Z',
                },
                nombre_de_documents: 2,
              },
            },
          },
        };

        // Transformation des données en tableau plat
        const coursesArray = [];

        for (const [professor, subjects] of Object.entries(apiData)) {
          for (const [subject, topics] of Object.entries(subjects)) {
            for (const [topic, details] of Object.entries(topics)) {
              coursesArray.push({
                ...details,
                professor,
                subject,
                topic,
                video: details.video, // On récupère l'objet vidéo,
                nombre_de_documents: details.nombre_de_documents,
              });
            }
          }
        }

        setCourses(coursesArray);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des cours:', err);
        setError('Impossible de charger les cours. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filtrage et tri
  const filteredCourses = courses
    .filter(
      course =>
        (selectedProfessor === 'Tous' ||
          course.professor === selectedProfessor) &&
        (selectedSubject === 'Tous' || course.subject === selectedSubject) &&
        (course.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.professor.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date_recent') {
        return (
          new Date(b.video.date_mise_en_ligne) -
          new Date(a.video.date_mise_en_ligne)
        );
      }
      return (
        new Date(a.video.date_mise_en_ligne) -
        new Date(b.video.date_mise_en_ligne)
      );
    });

  // Récupère les filtres uniques
  const professors = [...new Set(courses.map(course => course.professor))];
  const subjects = [...new Set(courses.map(course => course.subject))];
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
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucun cours trouvé avec ces critères.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id_cours} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDeleteModal = ({ setDeleteModalOpen }) => {
  const onClose = e => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteModalOpen(false);
  };

  const handleDelete = () => {
    console.log('Deleting course...');
    setDeleteModalOpen(false);
    window.location.reload();
    // Implement course deletion logic here
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${'block'}`}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="fixed inset-0 bg-gray-500 opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-50">
        <h2 className="text-lg font-medium mb-4">Supprimer le cours</h2>
        <p className="text-gray-600 mb-4">
          Voulez-vous vraiment supprimer ce cours ?
        </p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2 hover:bg-red-600 hover:text-white"
            onClick={handleDelete}
          >
            Supprimer
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-400 hover:text-gray-800"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseSettingsMenu = forwardRef((props, ref) => {
  CourseSettingsMenu.displayName = 'CourseSettingsMenu';

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDelete = () => {
    setDeleteModalOpen(true);
    // Implement course deletion logic here
  };

  if (isDeleteModalOpen)
    return <CourseDeleteModal setDeleteModalOpen={setDeleteModalOpen} />;
  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
    >
      <ul className="py-2">
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Modifier</li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          Supprimer
        </li>
      </ul>
    </div>
  );
});

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (divRef && divRef.current && !divRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(false);
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
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
      onClick={() => navigate(`/course-reader?courseId=${course.id_cours}`)}
      role="button"
      tabIndex="0"
    >
      {/* Aperçu Vidéo */}
      <div
        className="aspect-video bg-gray-100"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {course.video && (
          <img
            className="h-full w-full object-cover transition-opacity duration-300"
            src={`/videos/${course.video.video_id}/${
              isHovered ? `${course.video.video_id}.preview.webp` : '0.png'
            }`}
            alt={`Preview for ${course.titre}`}
            loading="lazy"
          />
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-4 space-y-2 relative">
        {/* Paramètres */}
        <div className="absolute top-2 right-2 z-1000">
          <Settings2
            className={`h-6 w-6 text-gray-600 transition-opacity duration-300`}
            onClick={handleSettingsClick}
          />

          {isOpen && <CourseSettingsMenu ref={divRef} />}
        </div>

        {/* Titre et description */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {course.titre}
          </h2>
          <p className="text-sm text-gray-600">{course.description}</p>
        </div>

        {/* Tags video + docs */}
        <div className="flex items-center gap-2">
          {course.video && (
            <div className="flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
              <SquarePlay className="mr-1.5 h-4 w-4" />
              <span>00:27:30</span>
            </div>
          )}
          {course.nombre_de_documents > 0 && (
            <div className="flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
              <FileText className="mr-1.5 h-4 w-4" />
              <span>{course.nombre_de_documents} documents</span>
            </div>
          )}
        </div>

        {/* Prof et date */}
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-gray-700">{course.professor}</span>
          <time className="text-gray-500">
            {course.video?.date_mise_en_ligne
              ? new Date(course.video.date_mise_en_ligne).toLocaleDateString(
                  'fr-FR'
                )
              : 'Date inconnue'}
          </time>
        </div>
      </div>
    </div>
  );
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

CourseCard.propTypes = {
  course: PropTypes.shape({
    id_cours: PropTypes.string.isRequired,
    titre: PropTypes.string.isRequired,
    description: PropTypes.string,
    video: PropTypes.shape({
      video_id: PropTypes.string,
      date_mise_en_ligne: PropTypes.string,
    }),
    nombre_de_documents: PropTypes.number,
    professor: PropTypes.string.isRequired,
    subject: PropTypes.string,
  }).isRequired,
};

FilterDropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

CourseDeleteModal.propTypes = {
  setDeleteModalOpen: PropTypes.func.isRequired,
};
export default Courses;
