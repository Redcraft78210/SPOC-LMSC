import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { FileText, SquarePlay } from 'lucide-react';

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

const CourseCard = ({ course }) => {
  CourseCard.propTypes = {
    course: PropTypes.shape({
      id_cours: PropTypes.number.isRequired,
      titre: PropTypes.string.isRequired,
      matiere: PropTypes.string.isRequired,
      date_debut: PropTypes.string.isRequired,
      date_fin: PropTypes.string.isRequired,
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
    window.location.href = '/course-reader?courseId=' + course.id_cours;
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
      onClick={handleClick}
    >
      {/* Image/aperçu vidéo */}
      <div
        className="aspect-video bg-gray-200 relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {course.video && (
          <>
            {isHovered ? (
              <img
                className="w-full h-full object-cover"
                src={`/videos/${course.video.video_id}/${course.video.video_id}.preview.webp`}
                alt={course.titre}
                style={{ display: 'block' }}
              />
            ) : (
              <img
                className="w-full h-full object-cover"
                src={`/videos/${course.video.video_id}/0.png`}
                alt={course.titre}
                style={{ display: 'block' }}
              />
            )}
          </>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="p-4 relative">
        <div className="flex flex-col items-end gap-2 absolute right-2 top-2">
          {course.video && (
            <div className="flex items-center">
              <SquarePlay className="w-4 h-4 mr-2" />
              <span className="text-xs text-gray-500">
                {/* {course.video.duree} */}
                00:27:30
              </span>
            </div>
          )}
          {course.nombre_de_documents > 0 && (
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-xs text-gray-500">
                {course.nombre_de_documents}
              </span>
            </div>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {course.titre}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span className="font-medium">{course.professor}</span>
          <span className="italic">
            {new Date(course.video.date_mise_en_ligne).toLocaleDateString(
              'fr-FR'
            )}
          </span>
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

FilterDropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default Courses;
