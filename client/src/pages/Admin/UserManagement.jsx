import { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { toast, Toaster } from 'react-hot-toast';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  generateInviteCode,
  getAllInviteCodes,
  deleteInviteCode,
  upgradeUserRole,
  retrogradeUserRole
} from '../../API/UserCaller';
import { getAllClasses } from '../../API/ClassCaller';
import {
  Edit,
  Trash2,
  UserPlus,
  Copy,
  KeyRound,
  List,
  Grid,
  Search,
  Check,
  Ban,
  Book,
  User,
  UserMinus,
  Shield,
  Clock,
  CircleX,
  XCircle,
} from 'lucide-react';
import UserManagementTutorial from '../../tutorials/UserManagementTutorial';

const errorMessages = {
  'auth/invalid-credentials': 'Identifiants incorrects',
  'auth/missing-fields': 'Veuillez remplir tous les champs',
  'auth/invalid-register-code': "Code d'inscription invalide/expiré",
  'auth/email-exists': 'Cet email est déjà utilisé',
  'auth/user-not-found': 'Utilisateur introuvable',
  'auth/username-exists': "Ce nom d'utilisateur est déjà utilisé",
  'auth/2fa-required': 'Vérification 2FA requise',
  'auth/invalid-2fa-code': 'Code de double authentification incorrect',
  'auth/weak-password':
    'Le mot de passe doit contenir au moins 12 caractères, une majuscule et un caractère spécial',
  default: 'Une erreur est survenue. Veuillez réessayer.',
};


const SearchUser = memo(function SearchUser({ value, onChange }) {
  return (
    <div className="searchuser relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value}
        onChange={onChange}
      />
    </div>
  );
});

SearchUser.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const UserManagement = () => {

  const fetchClasses = useCallback(async () => {
    try {
      const response = await getAllClasses();
      if (response.status === 200) {
        setClasses(response.data);
      } else {
        toast.error(response.message || "Erreur lors du chargement des classes");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      toast.error("Erreur lors du chargement des classes");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      if (response.status === 200) {
        setUsers(response.data);
      } else {
        toast.error(response.message || "Erreur lors du chargement des utilisateurs");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  }, []);

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, [fetchClasses, fetchUsers]);


  const getInitialViewMode = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 'grid' : 'list';
    }
    return 'list';
  };

  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && viewMode === 'list') {
        setViewMode('grid');
      } else if (window.innerWidth >= 640 && viewMode === 'grid') {
        setViewMode('list');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShowCreateModal(searchParams.get('create-user'));
    setShowInviteCodeModal(searchParams.get('invite-code'));
  }, []);


  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const toggleUser = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };


  const bulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      try {
        for (const userId of selectedUsers) {
          await deleteUser({ userId });
        }
        toast.success(`${selectedUsers.length} utilisateur(s) supprimé(s)`);
        setSelectedUsers([]);
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression des utilisateurs");
      }
    }
  };

  const bulkToggleStatus = async status => {
    try {
      for (const userId of selectedUsers) {
        if (status) {
          const response = await activateUser({ userId });
          if (response.status === 200) {
            toast.success(`Utilisateur activé`);
          } else {
            toast.error(response.message || "Erreur lors de l'activation de l'utilisateur");
          }
        } else {
          const response = await deactivateUser({ userId });
          if (response.status === 200) {
            toast.success(`Utilisateur désactivé`);
          } else {
            toast.error(response.message || "Erreur lors de la désactivation de certains utilisateurs");
          }
        }
      }
      toast.success(`${selectedUsers.length} utilisateur(s) ${status ? 'activé(s)' : 'désactivé(s)'}`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const toggleStatus = async (userId, status) => {
    try {
      if (status) {
        const response = await activateUser({ userId });
        if (response.status === 200) {
          toast.success(`Utilisateur activé`);
        } else {
          toast.error(response.message || "Erreur lors de l'activation de l'utilisateur");
        }
      } else {
        const response = await deactivateUser({ userId });
        if (response.status === 200) {
          toast.success(`Utilisateur désactivé`);
        } else {
          toast.error(response.message || "Erreur lors de la désactivation de l'utilisateur");
        }
      }
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const retrogradeUser = async userId => {
    try {
      const response = await retrogradeUserRole({ userId });

      if (response.status === 200) {
        toast.success(response.message || "Utilisateur rétrogradé avec succès");
      } else {
        toast.error(response.message || "Erreur lors de la rétrogradation");
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.data.message || "Erreur lors de la rétrogradation");
    }
  };

  const upgradeUser = async userId => {
    try {
      const response = await upgradeUserRole({ userId });

      if (response.status === 200) {
        toast.success(response.message || "Utilisateur promu avec succès");
      } else {
        toast.error(response.message || "Erreur lors de la promotion");
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.data.message || "Erreur lors de la promotion");
    }
  };

  const manageInvitationCodes = () => {
    setShowInviteCodeModal(true);
  };

  const handleUserSubmit = async userData => {
    try {
      let response;

      if (selectedUser) {
        response = await updateUser({
          userId: selectedUser.id,
          userData
        });
      } else {
        response = await createUser(userData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(selectedUser ? "Utilisateur mis à jour" : "Utilisateur créé");
        setShowCreateModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(response.message || "Erreur lors de l'opération");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const ToggleView = () => {
    return (
      <div className="flex gap-2 toggleView">
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
  };

  const BulkActions = () => {
    return (
      selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {selectedUsers.length} sélectionné(s)
            </span>
            <button
              onClick={bulkDelete}
              className=" px-4 py-2 rounded-lg btn-danger flex items-center hover:bg-red-600"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Supprimer
            </button>
            <button
              onClick={() => bulkToggleStatus(true)}
              className=" px-4 py-2 rounded-lg btn-success flex items-center hover:bg-green-600"
            >
              <Check className="w-5 h-5 mr-2" />
              Activer
            </button>
            <button
              onClick={() => bulkToggleStatus(false)}
              className="px-4 py-2 rounded-lg btn-warning flex items-center hover:bg-yellow-600"
            >
              <Ban className="w-5 h-5 mr-2" />
              Désactiver
            </button>
          </div>
        </div>
      )
    );
  };

  const UserTable = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length}
                  onChange={toggleAll}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Prénom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr
                key={user.id}
                className={
                  !user.active === 'actif' ? 'bg-gray-50 opacity-75' : ''
                }
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.surname}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white font-bold ${user.active === 'actif' ? 'bg-green-800' : 'bg-red-700'
                      }`}
                  >
                    {user.active.charAt(0).toUpperCase() + user.active.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white font-bold ${user.role === 'Administrateur'
                      ? 'bg-amber-500'
                      : user.role === 'Professeur'
                        ? 'bg-sky-800'
                        : 'bg-green-800'
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowCreateModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {user.active === 'actif' ? (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => toggleStatus(user.id, false)}
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => toggleStatus(user.id, true)}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {user.role === 'Etudiant' || user.role === 'Professeur' ? (
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => upgradeUser(user.id)}
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => retrogradeUser(user.id)}
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  )}
                  {user.role === 'Professeur' && (
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => retrogradeUser(user.id)}
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const UserCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`bg-white p-4 rounded-lg shadow ${user.active !== 'actif' ? 'opacity-75' : ''
              }`}
          >
            <div className="flex justify-between items-start">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowCreateModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="w-5 h-5" />
                </button>
                {user.active === 'actif' ? (
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => toggleStatus(user.id, false)}
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    className="text-green-600 hover:text-green-900"
                    onClick={() => toggleStatus(user.id, true)}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {user.role === 'Etudiant' || user.role === 'Professeur' ? (
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => upgradeUser(user.id)}
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    className="text-green-600 hover:text-green-900"
                    onClick={() => retrogradeUser(user.id)}
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                )}
                {user.role === 'Professeur' && (
                  <button
                    className="text-green-600 hover:text-green-900"
                    onClick={() => retrogradeUser(user.id)}
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              <div className="flex gap-2 mt-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${user.active === 'actif'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {user.active.charAt(0).toUpperCase() + user.active.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${user.role === 'Administrateur'
                    ? 'bg-red-100 text-red-800'
                    : user.role === 'Professeur'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                    }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const UserCreationModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      surname: '',
      email: '',
      role: 'Etudiant',
      newPassword: '',
      isPasswordGeneratedByAdmin: false,
    });
    const [initialUser, setInitialUser] = useState(null);

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      if (selectedUser) {
        setFormData({
          name: selectedUser.name,
          surname: selectedUser.surname,
          email: selectedUser.email,
          role: selectedUser.role,
          newPassword: '',
        });
        setInitialUser({
          name: selectedUser.name,
          surname: selectedUser.surname,
          email: selectedUser.email,
          role: selectedUser.role,
          newPassword: '',
        });
      }
      return () => setIsMounted(false);
    }, [setIsMounted]);

    const hasUnsavedChanges = useCallback(() => {
      if (
        !selectedUser &&
        (formData.name ||
          formData.surname ||
          formData.email ||
          formData.newPassword)
      )
        return true;
      if (selectedUser && initialUser) {
        const { name, surname, email, role } = formData;
        return (
          name !== initialUser.name ||
          surname !== initialUser.surname ||
          email !== initialUser.email ||
          role !== initialUser.role
        );
      }
      return false;
    }, [formData, initialUser]);

    useEffect(() => {
      const handleBeforeUnload = e => {
        if (hasUnsavedChanges()) {
          const message = 'Vous avez des modifications non enregistrées.';
          e.preventDefault();
          e.returnValue = message;
          return message;
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [hasUnsavedChanges, formData, initialUser]);

    const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) {
        newErrors.name = 'Le prénom est requis';
      } else if (formData.name.length > 50) {
        newErrors.name = 'Le prénom ne doit pas dépasser 50 caractères';
      }

      if (!formData.surname.trim()) {
        newErrors.surname = 'Le nom est requis';
      } else if (formData.surname.length > 50) {
        newErrors.surname = 'Le nom ne doit pas dépasser 50 caractères';
      }

      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      setServerError('');
      try {
        await handleUserSubmit(formData);
        if (isMounted) {
          setIsSuccess(true);
          setTimeout(() => {
            setShowCreateModal(false);
            setSelectedUser(null);
            setIsSuccess(false);
          }, 1500);
        }
      } catch (error) {

        const errorCode = error?.message || 'default';
        setServerError(errorMessages[errorCode] || errorMessages.default);
      } finally {
        setIsLoading(false);
      }
    };

    const handleClose = useCallback(() => {
      if (
        hasUnsavedChanges() &&
        !confirm('Etes-vous certain de vouloir annuler les modifications ?')
      )
        return;
      setShowCreateModal(false);
      setSelectedUser(null);
    }, [hasUnsavedChanges]);

    const handleBackdropClick = e => {
      if (e.target === e.currentTarget) handleClose();
    };

    useEffect(() => {
      const handleKeyDown = e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [handleClose]);

    const handleGeneratePassword = () => {
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const digits = '0123456789';
      const special = '!@#$%^&*()_+-=';
      const all = upper + lower + digits + special;


      let password = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        digits[Math.floor(Math.random() * digits.length)],
        special[Math.floor(Math.random() * special.length)],
      ];


      for (let i = password.length; i < 12; i++) {
        password.push(all[Math.floor(Math.random() * all.length)]);
      }


      password = password.sort(() => 0.5 - Math.random());

      password = password.join('');

      setFormData(prev => ({
        ...prev,
        newPassword: password,
        isPasswordGeneratedByAdmin: true
      }));
      return password;
    };

    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out z-10"
        onClick={handleBackdropClick}
        role="dialog"
        aria-labelledby="userModalTitle"
      >
        <div
          className={`bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out ${isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        >
          <h2
            id="userModalTitle"
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            {selectedUser ? "Modifier l'Utilisateur" : 'Nouvel Utilisateur'}
          </h2>

          {/* Affichage des erreurs du serveur */}
          {serverError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <input
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
              {/* Prénom */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <input
                    name="surname"
                    value={formData.surname}
                    onChange={e =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.surname
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                    aria-invalid={!!errors.surname}
                    aria-describedby="surnameError"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-3.5 text-sm text-gray-400">
                    {formData.surname.length}/50
                  </div>
                </div>
                {errors.surname && (
                  <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  aria-invalid={!!errors.email}
                  aria-describedby="emailError"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p id="emailError" className="text-red-600 text-sm mt-2 ml-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Rôle *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={e => {
                    setFormData({ ...formData, role: e.target.value });
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={isLoading}
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Professeur">Professeur</option>
                  <option value="Etudiant">Étudiant</option>
                </select>
              </div>
              {
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Générer un nouveau mot de passe
                </button>
              }
              {/* Afficher le mot de passe */}
              {formData.newPassword && (
                <div className="mt-4">
                  <p className="text-gray-700 text-sm mb-2">
                    Nouveau mot de passe :{' '}
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {formData.newPassword}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Ce mot de passe est généré aléatoirement et n&apos;est pas
                    stocké sur nos serveurs. Il est recommandé de le stocker en
                    lieu sûr (par exemple, dans un gestionnaire de mots de
                    passe).
                  </p>
                  <input type="hidden" name="password" value={formData.newPassword} />
                </div>
              )}
            </div>

            {/* Actions */}
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
                {selectedUser ? 'Mettre à jour' : 'Créer'}
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

  const InvitationCodeModal = ({ onClose }) => {
    const [copiedCode, setCopiedCode] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState({
      role: 'Etudiant',
      usageLimit: 1,
      validityPeriod: 24,
      classId: null,
    });
    const [assignClass, setAssignClass] = useState(false);
    const [existingCodes, setExistingCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const codesPerPage = 5;


    useEffect(() => {
      const fetchInviteCodes = async () => {
        try {
          setLoading(true);
          const response = await getAllInviteCodes();

          if (response.status === 200) {
            setExistingCodes(response.data || []);
          } else {
            toast.error(response.message || "Erreur lors du chargement des codes");
          }
        } catch (error) {
          console.error("Erreur lors du chargement des codes:", error);
          toast.error("Erreur lors du chargement des codes d'invitation");
        } finally {
          setLoading(false);
        }
      };

      fetchInviteCodes();
    }, []);

    const roleDetails = {
      Etudiant: { color: 'bg-blue-100', text: 'text-blue-800', icon: <Book /> },
      Professeur: { color: 'bg-green-100', text: 'text-green-800', icon: <User /> },
      Administrateur: { color: 'bg-red-100', text: 'text-red-800', icon: <Shield /> },
    };

    const handleGenerate = async () => {
      try {
        setLoading(true);
        const response = await generateInviteCode({
          role: formData.role,
          usageLimit: formData.usageLimit,
          validityPeriod: formData.validityPeriod,
          classId: assignClass ? formData.classId : null
        });

        if (response.status === 201) {

          const updatedCodesResponse = await getAllInviteCodes();
          if (updatedCodesResponse.status === 200) {
            setExistingCodes(updatedCodesResponse.data || []);
          }

          toast.success("Code d'invitation généré avec succès");
        } else {
          toast.error(response.message || "Erreur lors de la génération du code");
        }
      } catch (error) {
        console.error("Erreur lors de la génération du code:", error);
        toast.error("Erreur lors de la génération du code d'invitation");
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (codeId = null) => {
      try {
        setLoading(true);
        const codeToDelete = codeId || showConfirm;

        if (!codeToDelete) {
          throw new Error("ID de code manquant");
        }

        const response = await deleteInviteCode({ codeId: codeToDelete });

        if (response.status === 200) {

          const updatedCodesResponse = await getAllInviteCodes();
          if (updatedCodesResponse.status === 200) {
            setExistingCodes(updatedCodesResponse.data || []);
          }

          setShowConfirm(false);
          toast.success("Code d'invitation supprimé avec succès");
        } else {
          toast.error(response.message || "Erreur lors de la suppression du code");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du code:", error);
        toast.error("Erreur lors de la suppression du code d'invitation");
      } finally {
        setLoading(false);
      }
    };

    const getValidityStatus = code => {
      if (code.remainingUses === 0) return 'Épuisé';
      if (new Date() > code.expiresAt) return 'Expiré';
      return 'Actif';
    };

    const copyToClipboard = async code => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast.success('Code copié!');
      } catch (err) {
        console.error(err);
        toast.error('Échec de la copie');
      }
    };

    useEffect(() => {
      setPage(1);
    }, [filter]);

    const filteredCodes = existingCodes.filter(code => {
      if (filter === 'active') return getValidityStatus(code) === 'Actif';
      if (filter === 'expired') {
        return ['Expiré', 'Épuisé'].includes(getValidityStatus(code));
      }
      return true;
    });

    const paginatedCodes = filteredCodes.slice(
      (page - 1) * codesPerPage,
      page * codesPerPage
    );

    useEffect(() => {
      const intervalId = setInterval(() => {
        const now = new Date();
        const remainingCodes = existingCodes.filter(code => {
          const isExpired = now > code.expiresAt;
          const isDepleted = code.remainingUses === 0;
          return !(isExpired || isDepleted);
        });

        if (remainingCodes.length !== existingCodes.length) {
          setExistingCodes(remainingCodes);
          toast.info('Codes inutiles supprimés');
        }
      }, 3600000);

      return () => clearInterval(intervalId);
    }, [existingCodes]);

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out z-10">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Gestion des codes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <CircleX className="w-9 h-9" />
            </button>
          </div>

          {/* Formulaire de création */}
          <div className="mb-8 p-1 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Générer un nouveau code
            </h3>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
              <p className="text-sm font-medium">
                Attention : veuillez ne pas créer de codes inutiles, cela peut
                entraîner des problèmes techniques ou des risques de sécurité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rôle</label>
                <select
                  value={formData.role}
                  onChange={e =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="Etudiant">Étudiant</option>
                  <option value="Professeur">Enseignant</option>
                  <option value="Administrateur">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre d&apos;utilisations
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Validité (heures)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.validityPeriod}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      validityPeriod: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Checkbox and class selection */}
            {formData.role === 'student' && (
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={assignClass}
                    onChange={e => setAssignClass(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Assigner une classe</span>
                </label>
                {assignClass && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-2">
                      Classe
                    </label>
                    <select
                      value={formData.classId || ''}
                      onChange={e =>
                        setFormData({ ...formData, classId: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="" disabled>
                        Sélectionnez une classe
                      </option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Génération...' : 'Générer le code'}
            </button>
          </div>

          {/* Liste des codes existants */}
          <div className="border-t pt-6">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Chargement...
              </div>
            ) : paginatedCodes.length === 0 ? (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Codes d&apos;invitation existants
                </h3>
                <div className="text-center py-4 text-gray-500">
                  <p>Aucun code trouvé</p>
                  <div className="flex justify-center items-center">
                    <KeyRound className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Codes générés</h3>
                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-3 py-1 border rounded"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="expired">Expirés/Épuisés</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {paginatedCodes.map(code => {
                    const status = getValidityStatus(code);
                    const { color, text, icon } = roleDetails[code.role];

                    return (
                      <div
                        key={code.value}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{code.value}</span>
                            <span
                              className={`flex justify-space-around items-center align-middle text-xs px-2 py-1 rounded ${color} ${text}`}
                            >
                              {icon} {code.role}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${status === 'Actif'
                                ? 'bg-green-100 text-green-800'
                                : status === 'Expiré'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-4">
                              <span>
                                <Clock className="inline w-4 h-4 mr-1" />
                                {Math.ceil(
                                  (code.expiresAt - new Date()) /
                                  (1000 * 60 * 60)
                                )}
                                h restantes
                              </span>
                              <span>
                                Utilisations: {code.remainingUses}/
                                {code.usageLimit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(code.value)}
                            className="text-gray-500 hover:text-blue-500"
                          >
                            {copiedCode === code.value ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(code.value)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pagination et confirmation de suppression... */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg text-center">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-4">
                    Supprimer ce code ?
                  </h4>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    {loading ? 'Suppression...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Précédent
              </button>
              <span>
                Page {page} sur{' '}
                {Math.ceil(filteredCodes.length / codesPerPage) || 1}
              </span>
              <button
                disabled={page * codesPerPage >= filteredCodes.length}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  InvitationCodeModal.propTypes = {
    onClose: PropTypes.func.isRequired,
  };
  return (
    <div className="container mx-auto p-6">
      <Toaster position="bottom-right" reverseOrder={false} />
      <UserManagementTutorial />

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Utilisateurs
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Créer un utilisateur
            </button>

            <button
              onClick={manageInvitationCodes}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            >
              <KeyRound className="w-5 h-5 mr-2" />
              Gérer les codes d&apos;invitation
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <SearchUser value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <ToggleView />
        </div>
        <BulkActions />
      </div>

      {viewMode === 'list' ? <UserTable /> : <UserCards />}

      {/* Modale de création/utilisateur */}
      {showCreateModal && <UserCreationModal />}

      {/* Modale code d'inscription */}
      {showInviteCodeModal && (
        <InvitationCodeModal onClose={() => setShowInviteCodeModal(false)} />
      )}
    </div>
  );
};








UserManagement.propTypes = {
  authToken: PropTypes.string.isRequired,
  viewMode: PropTypes.oneOf(['list', 'grid']),
  showCreateModal: PropTypes.bool,
  fetchUsers: PropTypes.func,
};

export default UserManagement;
