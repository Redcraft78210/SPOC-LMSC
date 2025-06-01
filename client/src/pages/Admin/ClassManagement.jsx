import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  Edit,
  Trash2,
  UserPlus,
  Users,
  List,
  Grid,
  Search,
} from 'lucide-react';
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
} from '../../API/ClassCaller';
import { getAllUsers } from '../../API/UserCaller';

const ClasseManagement = () => {

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      if (response.status === 200) {
        setClasses(response.data);
      } else {
        toast.error(response.message || 'Erreur lors du chargement des classes');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      toast.error('Erreur lors du chargement des classes');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.status === 200) {
        // Séparer les étudiants et les enseignants
        const students = response.data.filter(user => user.role === 'Etudiant');
        const teachers = response.data.filter(user => user.role === 'Professeur');

        setStudentUsers(students);
        setTeachersUsers(teachers);
      } else {
        toast.error(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const [classes, setClasses] = useState([]);
  const [studentsUsers, setStudentUsers] = useState([]);
  const [teachersUsers, setTeachersUsers] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchUsers();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShowCreateModal(searchParams.get('create-class') === 'true');
  }, []);

  // Filtrage des Classes
  const filteredClasses = classes.filter(
    Classe =>
      Classe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Classe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gestion de la sélection
  const toggleAll = () => {
    setSelectedClasses(prev =>
      prev.length === filteredClasses.length
        ? []
        : filteredClasses.map(g => g.id)
    );
  };

  const toggleClasse = ClasseId => {
    setSelectedClasses(prev =>
      prev.includes(ClasseId)
        ? prev.filter(id => id !== ClasseId)
        : [...prev, ClasseId]
    );
  };

  // Suppression Classeée
  const bulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedClasses.length} Classe(s) ?`)) {
      try {
        // Utilisation d'une boucle pour supprimer chaque classe individuellement
        for (const classId of selectedClasses) {
          await deleteClass({ classId });
        }
        toast.success(`${selectedClasses.length} classe(s) supprimée(s)`);
        setSelectedClasses([]);
        fetchClasses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression des classes');
      }
    }
  };

  // Suppression individuelle
  const deleteClasseHandler = async classId => {
    if (window.confirm('Supprimer cette Classe ?')) {
      try {
        const response = await deleteClass({ classId });
        if (response.status === 200) {
          toast.success('Classe supprimée avec succès');
        } else {
          toast.error(response.message || 'Erreur lors de la suppression');
        }
        fetchClasses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la classe');
      }
    }
  };

  // Gestion formulaire
  const handleSubmitClasse = async formData => {
    const classData = {
      name: formData.name,
      description: formData.description,
      main_teacher_id: formData.main_teacher_id,
      students: formData.students,
    };

    try {
      let response;

      if (selectedClasse) {
        response = await updateClass({
          classId: selectedClasse.id,
          classData,
        });
      } else {
        response = await createClass(classData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(selectedClasse ? 'Classe mise à jour' : 'Classe créée');
        setShowCreateModal(false);
        setSelectedClasse(null);
        fetchClasses();
      } else {
        toast.error(response.message || "Erreur lors de l'opération");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };

  // Composants UI
  const SearchBar = () => (
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher une classe..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
    </div>
  );

  const ToggleView = () => (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
      >
        <Grid className="w-5 h-5" />
      </button>
    </div>
  );

  const BulkActions = () =>
    selectedClasses.length > 0 && (
      <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-6">
        <span className="font-medium">
          {selectedClasses.length} sélectionné(s)
        </span>
        <button
          onClick={bulkDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center hover:bg-red-700"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Supprimer
        </button>
      </div>
    );

  const ClasseTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">
              <input
                type="checkbox"
                checked={selectedClasses.length === filteredClasses.length}
                onChange={toggleAll}
                className="rounded text-blue-600"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Enseignant principal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Membres
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredClasses.map(Classe => (
            <tr key={Classe.id}>
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(Classe.id)}
                  onChange={() => toggleClasse(Classe.id)}
                  className="rounded text-blue-600"
                />
              </td>
              <td className="px-6 py-4 font-medium">{Classe.name}</td>
              <td className="px-6 py-4">
                {Classe.main_teacher_id ? (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-gray-400" />
                    {
                      teachersUsers.find(
                        user => user.id === Classe.main_teacher_id
                      )?.name
                    }
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-gray-400" />
                    Aucun enseignant principal
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {Classe.description
                  ? `${Classe.description
                    .charAt(0)
                    .toUpperCase()}${Classe.description.slice(1)}`
                  : 'Aucune description'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  {Classe.memberCount || 0}
                </div>
              </td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => {
                    setSelectedClasse(Classe);
                    setShowCreateModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteClasseHandler(Classe.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ClasseCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredClasses.map(Classe => (
        <div key={Classe.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <input
              type="checkbox"
              checked={selectedClasses.includes(Classe.id)}
              onChange={() => toggleClasse(Classe.id)}
              className="rounded text-blue-600"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedClasse(Classe);
                  setShowCreateModal(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteClasseHandler(Classe.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{Classe.name}</h3>
            <p className="text-gray-600 text-sm mt-2">
              {Classe.description
                ? `${Classe.description.charAt(0).toUpperCase()}${Classe.description.slice(1)}`
                : 'Aucune description'}
            </p>
            <div className="flex items-center mt-4 text-gray-500">
              <Users className="w-5 h-5 mr-2" />
              <span>
                {Classe.memberCount || 0} membre{Classe.memberCount > 1 && 's'}
              </span>
            </div>
            <div className="flex items-center mt-2 text-gray-500">
              <Users className="w-5 h-5 mr-2" />
              {Classe.main_teacher_id ? (
                <span>
                  {
                    teachersUsers.find(user => user.id === Classe.main_teacher_id)
                      ?.name || 'Aucun enseignant principal'
                  }
                </span>
              ) : (
                <span>Aucun enseignant principal</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  const ClasseCreationModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      main_teacher_id: 0,
      students: [],
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
      setIsMounted(true);
      if (selectedClasse) {
        setFormData({
          name: selectedClasse.name,
          description: selectedClasse.description || '',
          main_teacher_id: selectedClasse.main_teacher_id || 0,
          students: selectedClasse.students || [], // Synchroniser les élèves
        });
      }
      return () => setIsMounted(false);
    }, [setIsMounted]);

    const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom de la classe est requis';
      } else if (formData.name.length > 50) {
        newErrors.name = 'Le nom ne doit pas dépasser 50 caractères';
      }

      if (formData.description.length > 200) {
        newErrors.description =
          'La description ne doit pas dépasser 200 caractères';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const toggleMember = userId => {
      setFormData(prev => ({
        ...prev,
        students: prev.students.includes(userId)
          ? prev.students.filter(id => id !== userId)
          : [...prev.students, userId],
      }));
    };

    const filteredUsers = studentsUsers.filter(
      user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async e => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      try {

        await handleSubmitClasse(formData);
        if (isMounted) {
          setIsSuccess(true);
          setTimeout(() => {
            setShowCreateModal(false);
            setSelectedClasse(null);
            setIsSuccess(false);
          }, 1500);
        }
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const handleClose = () => {
      setShowCreateModal(false);
      setSelectedClasse(null);
    };

    // Handle backdrop click
    const handleBackdropClick = e => {
      if (e.target === e.currentTarget) handleClose();
    };

    // Handle Escape key
    useEffect(() => {
      const handleKeyDown = e => {
        if (e.key === 'Escape') handleClose();
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out z-10"
        onClick={handleBackdropClick}
        role="dialog"
        aria-labelledby="modalTitle"
      >
        <div
          className={`bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out ${isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        >
          <h2 id="modalTitle" className="text-2xl font-bold text-gray-900 mb-6">
            {selectedClasse ? 'Modifier la Classe' : 'Nouvelle Classe'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Nom de la Classe *
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                    aria-invalid={!!errors.name}
                    aria-describedby="nameError"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-3.5 text-sm text-gray-400">
                    {formData.name.length}/50
                  </div>
                </div>
                {errors.name && (
                  <p id="nameError" className="text-red-600 text-sm mt-2 ml-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.description
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                    rows="3"
                    aria-invalid={!!errors.description}
                    aria-describedby="descError"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 bottom-3 text-sm text-gray-400">
                    {formData.description.length}/200
                  </div>
                </div>
                {errors.description && (
                  <p id="descError" className="text-red-600 text-sm mt-2 ml-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Main Teacher Field */}
              <div>
                <label
                  htmlFor="main_teacher"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Enseignant Principal
                </label>
                <select
                  id="main_teacher"
                  name="main_teacher"
                  value={formData.main_teacher_id}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      main_teacher_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={isLoading}
                >
                  <option value="0">cliquez pour sélectionner...</option>
                  {teachersUsers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Students Section */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Élèves de la Classe
                </label>

                {/* Selected Users Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.students.map(userId => {
                    const user = studentsUsers.find(u => u.id === userId);
                    return (
                      <span
                        key={userId}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors hover:bg-blue-200"
                      >
                        {user?.name || 'Unknown User'}
                        <button
                          type="button"
                          onClick={() => toggleMember(userId)}
                          className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Remove user"
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* User Search Input */}
                <input
                  type="text"
                  placeholder="Rechercher des utilisateurs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />

                {/* Users List */}
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${formData.students.includes(user.id) ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => toggleMember(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.students.includes(user.id)}
                        readOnly
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3 space-y-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <p className="p-3 text-sm text-gray-500">
                      Aucun utilisateur trouvé
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {selectedClasse ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </form>

          {/* Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-xl animate-pulse">
              <div className="flex items-center gap-2 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Succès!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Classes
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Créer une classe
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <SearchBar />
          <ToggleView />
        </div>
        <BulkActions />
      </div>

      {viewMode === 'list' ? <ClasseTable /> : <ClasseCards />}

      {showCreateModal && <ClasseCreationModal />}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ClasseManagement;
