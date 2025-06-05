import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Toaster, toast } from 'react-hot-toast';
import { FileText, SquarePlay, Radio, ShieldEllipsis, ShieldBan } from 'lucide-react'; // Ajout de ShieldEllipsis
import { useNavigate } from 'react-router-dom';
import { getAllCourses, disapproveCourse, unblockCourse, deleteCourse } from '../API/CourseCaller';
import { getAllLives, endLive, disapproveLive, blockLive, unblockLive, deleteLive } from '../API/LiveCaller';
import CoursesLibraryTutorial from '../tutorials/CoursesLibraryTutorial';

const Courses = ({ authToken, userRole }) => {
  const [selectedProfessor, setSelectedProfessor] = useState('Tous');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_recent');
  const [selectedType, setSelectedType] = useState('Tous');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Déplacez fetchData ici
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

  useEffect(() => {
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

  console.log(content);

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
      <Toaster position="top-center" />
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bibliothèque de Cours
          </h1>
        </div>
      </header>

      {/* Add the tutorial component */}
      <CoursesLibraryTutorial />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Barre de recherche et filtres */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="mb-4">
            <label className="sr-only" htmlFor="search">
              Rechercher
            </label>
            <div className="relative">
              {/* Make sure the id matches the tutorial target */}
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
            <div className="filter-type">
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
            <div className="filter-professor">
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
            <div className="filter-subject">
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
              <ContentCard
                key={item.id}
                item={item}
                userRole={userRole}
                onActionDone={fetchData}
                className="course-card" // Add this class for the tutorial
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContentCard = ({ item, userRole, onActionDone }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [justification, setJustification] = useState('');
  const hoverTimeout = useRef(null);
  const menuRef = useRef(null);

  // Ajout pour le message flottant
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [modButtonHovered, setModButtonHovered] = useState(false);

  // Gestion du survol pour le tooltip bloqué
  const handleBlockedMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
    if (!showBlockedTooltip) setShowBlockedTooltip(true);
  };

  const handleBlockedMouseLeave = () => {
    setShowBlockedTooltip(false);
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
    if (action === 'disapprove') {
      setShowDisapproveModal(true);
    } else if (action === 'stop') {
      setShowStopModal(true);
    } else if (action === 'unblock') {
      item.type === 'cours' && handleUnblockCourse();
      item.type === 'live' && handleUnblockLive();
    } else if (action === 'delete') {
      item.type === 'cours' && handleDeleteCourse();
      item.type === 'live' && handleDeleteLive();
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

  const handleCourseDisapproval = async () => {
    if (!justification.trim() || justification.length < 50) {
      toast.error('Veuillez fournir une justification d\'au moins 50 caractères pour la désapprobation.');
      return;
    }
    try {
      const response = await disapproveCourse({
        courseId: item.id,
        justification,
      });

      if (response.status === 200) {
        toast.success('Cours désapprouvé avec succès');
        console.log('Désapprobation réussie:', response.data);
        setShowDisapproveModal(false);
        setJustification('');
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors de la désapprobation du cours');
      }
    } catch (error) {
      console.error('Erreur lors de la désapprobation du cours:', error);
      toast.error('Une erreur est survenue lors de la désapprobation du cours');
    }
  };

  const isValidJustification = (justification) => {
    if (!justification.trim() || justification.length < 50) {
      toast.error('Veuillez fournir une justification d\'au moins 50 caractères.');
      return false;
    }
    return true;
  };


  const handleLiveDisapproval = async () => {
    if (!isValidJustification(justification)) return;
    try {
      const response = await disapproveLive({
        liveId: item.id,
        justification,
      });
      if (response.status === 200) {
        toast.success('Live désapprouvé avec succès');
        console.log('Désapprobation réussie:', response.data);
        setShowDisapproveModal(false);
        setJustification('');
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors de la désapprobation du live');
      }
    } catch (error) {
      console.error('Erreur lors de la désapprobation du live:', error);
      toast.error('Une erreur est survenue lors de la désapprobation du live');
    }
  };

  const handleStopLive = async () => {
    if (!isValidJustification(justification)) return;

    try {
      const response = await endLive({
        liveId: item.id,
        justification,
      });

      const blockResponse = await blockLive({ liveId: item.id, justification });
      if (blockResponse.status !== 200) {
        throw new Error(blockResponse.message || 'Erreur lors du blocage du live');
      }

      if (response.status === 200) {
        toast.success('Live arrêté avec succès');
        console.log('Arrêt réussi:', response.data);
        setShowStopModal(false);
        setJustification('');
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors de l\'arrêt du live');
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du live:', error);
      toast.error('Une erreur est survenue lors de l\'arrêt du live');
    }
  };

  const handleUnblockCourse = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir débloquer ce cours ?')) {
      return;
    }
    try {
      const response = await unblockCourse(item.id);
      if (response.status === 200) {
        toast.success('Cours débloqué avec succès');
        console.log('Déblocage réussi:', response.data);
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors du déblocage du cours');
      }
    } catch (error) {
      console.error('Erreur lors du déblocage du cours:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors du déblocage du cours'
      );
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }
    try {
      const response = await deleteCourse(item.id);
      if (response.status === 200) {
        toast.success('Cours supprimé avec succès');
        console.log('Suppression réussie:', response.data);
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du cours');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la suppression du cours'
      );
    }
  };


  const handleUnblockLive = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir débloquer ce live ?')) {
      return;
    }
    try {
      const response = await unblockLive(item.id);
      if (response.status === 200) {
        toast.success('Live débloqué avec succès');
        console.log('Déblocage réussi:', response.data);
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors du déblocage du cours');
      }
    } catch (error) {
      console.error('Erreur lors du déblocage du live:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors du déblocage du cours'
      );
    }
  };

  const handleDeleteLive = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce live ?')) {
      return;
    }
    try {
      const response = await deleteLive(item.id);
      if (response.status === 200) {
        toast.success('Live supprimé avec succès');
        console.log('Suppression réussie:', response.data);
        onActionDone(); // <-- Ajoutez ceci pour rafraîchir la liste
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du live');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du live:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la suppression du live'
      );
    }
  };

  const disapproveCourseModal = (item) => {
    // Modale de désapprobation de cours avec justification
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-100"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg"
          onClick={e => e.stopPropagation()} // Empêche la propagation vers le fond
        >
          <h2 className="text-xl font-semibold mb-4">Désapprouver le {item.type}</h2>
          <p>Êtes-vous sûr de vouloir désapprouver le {item.type} &quot;{item.titre}&quot; ?</p>
          <p className="mt-2 text-sm text-gray-500">
            Celui-ci sera retiré de la bibliothèque et ne sera plus accessible aux utilisateurs.
          </p>
          <textarea
            className="w-full mt-4 p-2 border rounded"
            placeholder="Justification (obligatoire)"
            value={justification}
            onChange={e => setJustification(e.target.value)}
            maxLength={255}
            cols="30"
            rows="4"
            required
          />
          <div className="mt-4 flex justify-end">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded mr-2"
              onClick={item.type === 'cours' ? handleCourseDisapproval : handleLiveDisapproval}
              disabled={!justification.trim()}
            >
              Désapprouver
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={() => setShowDisapproveModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stopLiveModal = ({ live }) => {
    // Modale d'arrêt de live avec justification
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-100"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg"
          onClick={e => e.stopPropagation()} // Empêche la propagation vers le fond
        >
          <h2 className="text-xl font-semibold mb-4">Arrêter le live</h2>
          <p>Êtes-vous sûr de vouloir arrêter le live &quot;{live.titre}&quot; ?</p>
          <p className="mt-2 text-sm text-gray-500">
            Celui-ci sera retiré de la bibliothèque, sera arrêté et ne sera plus accessible aux utilisateurs.
          </p>
          <textarea
            className="w-full mt-4 p-2 border rounded"
            placeholder="Justification (obligatoire)"
            value={justification}
            onChange={e => setJustification(e.target.value)}
            maxLength={255}
            cols="30"
            rows="4"
            required
          />
          <div className="mt-4 flex justify-end">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded mr-2"
              onClick={handleStopLive}
              disabled={!justification.trim()}
            >
              Arrêter
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={() => setShowStopModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative 
      ${(userRole !== 'Etudiant' && (item.status === 'blocked' || item.live?.statut === 'blocked' || item.live?.statut === 'disapproved') && 'border-2 border-red-500')}
      ${userRole !== 'Etudiant' && (item.status === 'blocked' || item.live?.statut === 'blocked' || item.live?.statut === 'disapproved') && showBlockedTooltip && !modButtonHovered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={
        userRole === 'Administrateur' && (item.status === 'blocked' || item.live?.statut === 'blocked' || item.live?.statut === 'disapproved')
          ? handleBlockedMouseMove
          : undefined
      }
      onMouseOut={
        userRole === 'Administrateur' && (item.status === 'blocked' || item.live?.statut === 'blocked' || item.live?.statut === 'disapproved')
          ? handleBlockedMouseLeave
          : undefined
      }
      onClick={handleClick}
    >
      {/* Tooltip flottant pour cours bloqué */}
      {userRole === 'Administrateur' && (item.status === 'blocked' || item.live?.statut === 'blocked' || item.live?.statut === 'disapproved') && showBlockedTooltip && !modButtonHovered && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y + 16,
            maxWidth: 320,
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid #ef4444',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            padding: '1rem',
            color: '#991b1b',
            fontSize: '0.95rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          }}
        >
          <div className="font-bold mb-1 text-red-700">Statut : Bloqué</div>
          <div className="text-gray-700 whitespace-pre-line break-words">
            <span className="font-semibold text-red-600">Motif :</span>
            <br />
            {item.block_reason || item.live.block_reason || 'Aucun motif fourni.'}
          </div>
        </div>
      )}
      {showDisapproveModal && disapproveCourseModal(item)}
      {showStopModal && stopLiveModal({ live: item })}
      {/* Bouton de modération pour les administrateurs */}
      {userRole === 'Administrateur' && (
        <div
          className="absolute top-2 right-2 z-10"
          onClick={e => e.stopPropagation()}
          onMouseEnter={() => setModButtonHovered(true)}
          onMouseLeave={() => setModButtonHovered(false)}
        >
          <button
            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 hover:shadow-lg transition-colors"
            onClick={handleMenuToggle}
          >
            <ShieldEllipsis className="h-7 w-7 text-gray-600" />
          </button>
          {showModMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-20"
              onMouseEnter={() => setModButtonHovered(true)}
              onMouseLeave={() => setModButtonHovered(false)}
            >
              {(item.live?.statut === 'scheduled' || item.type == 'cours') && item.status === 'blocked' ? (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={e => handleModAction('unblock', e)}
                >
                  Débloquer
                </button>
              ) : (item.live?.statut === 'scheduled' || item.type == 'cours') && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={e => handleModAction('disapprove', e)}
                >
                  Désapprouver
                </button>
              )}
              {item.live?.statut === 'ongoing' ? (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={e => handleModAction('stop', e)}
                >
                  Arrêter le live
                </button>
              ) : item.live?.statut === 'blocked' || item.live?.statut === 'disapproved' && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={e => handleModAction('unblock', e)}
                >
                  Autoriser la reprise du live
                </button>
              )}
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

      {/* Bouton d'édition pour les professeurs */}
      {userRole === 'Professeur' && (
        <div
          className="absolute top-2 right-2 z-10"
          onClick={e => e.stopPropagation()}
          onMouseEnter={() => setModButtonHovered(true)}
          onMouseLeave={() => setModButtonHovered(false)}
        >
          <button
            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 hover:shadow-lg transition-colors"
            onClick={handleMenuToggle}
          >
            <ShieldEllipsis className="h-7 w-7 text-gray-600" />
          </button>
          {showModMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-20"
              onMouseEnter={() => setModButtonHovered(true)}
              onMouseLeave={() => setModButtonHovered(false)}
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
          ) : item.live?.statut === 'scheduled' ? (
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
          ) : item.live?.statut === 'ongoing' ? (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
              <div className="text-center">
                <Radio className="w-11 h-11 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-600 font-medium">
                  Live en cours
                </p>
              </div>
            </div>
          ) : item.live?.statut === 'blocked' ? (<div className="w-full h-full bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <ShieldBan className="w-11 h-11 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">
                <strong>Live bloqué</strong>
              </p>
            </div>
          </div>) : item.live?.statut === 'disapproved' ? (<div className="w-full h-full bg-blue-50 flex items-center justify-center">
            <div className="text-center">
              <ShieldBan className="w-11 h-11 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">
                <strong>Live programmé refusé</strong>
              </p>
            </div>
          </div>) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Aucune image disponible</p>
            </div>
          )}
        </div>

        <div className="p-4 relative h-full flex flex-col justify-between">
          {/* Header section with title and indicators */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {item.titre}
            </h2>

            <div className="flex flex-wrap gap-2 items-center mt-2">
              {/* Video duration indicator */}
              {item.type === 'cours' && item.video && (
                <div className="flex items-center text-xs text-gray-500">
                  <SquarePlay className="w-4 h-4 mr-1" />
                  <span>
                    {item.video.duration !== null
                      ? formatDuration(parseInt(item.video.duration, 10))
                      : 'N/A'}
                  </span>
                </div>
              )}

              {/* Documents count indicator */}
              {item.type === 'cours' && item.nombre_de_documents > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{item.nombre_de_documents} document(s)</span>
                </div>
              )}

              {/* Live status badges */}
              {item.live?.statut === 'scheduled' && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs whitespace-nowrap ml-auto">
                  En direct à{' '}
                  {new Date(item.live.date_debut).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
              {item.live?.statut === 'ongoing' && (
                <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  En direct
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 my-3">
            {item.description}
          </p>

          {/* Footer with professor and date */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
            <span className="font-medium truncate max-w-[60%]">{item.professor}</span>
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
    status: PropTypes.string, // Ajouté pour les administrateurs
    block_reason: PropTypes.string, // Ajouté pour les administrateurs
    type: PropTypes.oneOf(['cours', 'live']).isRequired,
    live: PropTypes.shape({
      date_debut: PropTypes.string,
      statut: PropTypes.string,
      block_reason: PropTypes.string, // Ajouté pour les administrateurs
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
  onActionDone: PropTypes.func, // Ajoutez ceci
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
