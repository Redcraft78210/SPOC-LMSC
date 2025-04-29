import { useState, useEffect, useCallback } from 'react';
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

import PropTypes from 'prop-types';

import { Toaster, toast } from 'react-hot-toast';

const API_URL = 'https://localhost:8443/api';

const UserManagement = ({ authToken }) => {
  const token = authToken;

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setClasses(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error(error);
      toast.error('Erreur de chargement des Classes');
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(
        data.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return nameA.localeCompare(nameB, undefined, {
            numeric: true,
          });
        })
      );
    } catch (error) {
      console.error(error);
      toast.error('Erreur de chargement des utilisateurs');
    }
  }, [token]);

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShowCreateModal(searchParams.get('create-user'));
    setShowInviteCodeModal(searchParams.get('invite-code'));
  }, []);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Gestion de la sélection
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

  // Actions groupées
  const bulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      try {
        const promises = selectedUsers.map(userId => {
          return fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        });

        await Promise.all(promises);
        toast.success(
          `${selectedUsers.length} utilisateur(s) supprimés avec succès`
        );
        fetchUsers();
        setSelectedUsers([]);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de la suppression des utilisateurs');
      }
    }
  };

  const bulkToggleStatus = async status => {
    try {
      const selectedIds = new Set(selectedUsers);
      const promises = filteredUsers
        .filter(user => selectedIds.has(user.id))
        .map(user => {
          return fetch(`${API_URL}/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ statut: status }),
          });
        });

      await Promise.all(promises);
      toast.success(
        `Statut de ${selectedUsers.length} utilisateur(s) mis à jour avec succès`
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour des statuts');
    }
  };

  const toggleStatus = async (userId, status) => {
    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: status }),
      });
      toast.success('Statut utilisateur mis à jour');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Erreur de modification du statut');
    }
  };

  const manageInvitationCodes = () => {
    setShowInviteCodeModal(true);
  };

  const deleteUser = async userId => {
    if (
      window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')
    ) {
      try {
        await fetch(`${API_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      } catch (error) {
        console.error(error);
        toast.error("Erreur de suppression de l'utilisateur");
      }
    }
  };

  const handleSubmitUser = async e => {
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      surname: formData.get('surname'),
      email: formData.get('email'),
      role: formData.get('role'),
      password: formData.get('password'),
    };

    try {
      let response;
      if (selectedUser) {
        // Update user
        response = await fetch(`${API_URL}/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userData,
            isPasswordGeneratedByAdmin: userData.password ? true : undefined,
          }),
        });
      } else {
        // Create new user
        userData.password = formData.get('password');
        response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) throw new Error('Erreur lors de la requête');

      toast.success(
        selectedUser ? 'Utilisateur mis à jour' : 'Utilisateur créé avec succès'
      );
      fetchUsers();
      setShowCreateModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(
        error.message || "Erreur lors de la sauvegarde de l'utilisateur"
      );

      throw error;
    }
  };

  const SearchUser = () => {
    return (
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    );
  };

  const ToggleView = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg ${
            viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg ${
            viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
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

  const retrogradeUser = async userId => {
    try {
      const response = await fetch(`${API_URL}/users/retrograde/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(data.message);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      fetchUsers();
    }
  };

  const upgradeUser = async userId => {
    try {
      const response = await fetch(`${API_URL}/users/upgrade/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(data.message);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      fetchUsers();
    }
  };

  const UserTable = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white font-bold ${
                      user.active === 'actif' ? 'bg-green-800' : 'bg-red-700'
                    }`}
                  >
                    {user.active.charAt(0).toUpperCase() + user.active.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white font-bold ${
                      user.role === 'Administrateur'
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
            className={`bg-white p-4 rounded-lg shadow ${
              !user.active === 'actif' ? 'opacity-75' : ''
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
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              <div className="flex gap-2 mt-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.active === 'actif'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.active.charAt(0).toUpperCase() + user.active.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'Administrateur'
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
      role: 'élève',
      password: '',
    });
    const [initialUser, setInitialUser] = useState(null);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [newPassword, setNewPassword] = useState(null);

    useEffect(() => {
      setIsMounted(true);
      if (selectedUser) {
        setFormData({
          name: selectedUser.name,
          surname: selectedUser.surname,
          email: selectedUser.email,
          role: selectedUser.role,
          password: '',
        });
        setInitialUser({
          name: selectedUser.name,
          surname: selectedUser.surname,
          email: selectedUser.email,
          role: selectedUser.role,
          password: '',
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
          formData.password)
      )
        return true;
      if (selectedUser && initialUser) {
        const { name, surname, email, role } = formData;
        return (
          name !== initialUser.name ||
          surname !== initialUser.surname ||
          email !== initialUser.email ||
          role !== initialUser.role ||
          (newPassword && newPassword !== initialUser.password)
        );
      }
      return false;
    }, [formData, initialUser, newPassword, selectedUser]);

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
    }, [hasUnsavedChanges, formData, newPassword, initialUser]);

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

      if (!selectedUser && !formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length > 0 && formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit faire au moins 8 caractères';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      try {
        await handleSubmitUser(e);
        if (isMounted) {
          setIsSuccess(true);
          setTimeout(() => {
            setShowCreateModal(false);
            setSelectedUser(null);
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
      if (
        hasUnsavedChanges() &&
        !confirm('Etes-vous certain de vouloir annuler les modifications ?')
      )
        return;
      setShowCreateModal(false);
      setSelectedUser(null);
    };

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
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      setFormData(prev => ({ ...prev, password }));
      setNewPassword(password);
      return password;
    };

    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out"
        onClick={handleBackdropClick}
        role="dialog"
        aria-labelledby="userModalTitle"
      >
        <div
          className={`bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out ${
            isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <h2
            id="userModalTitle"
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            {selectedUser ? "Modifier l'Utilisateur" : 'Nouvel Utilisateur'}
          </h2>

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
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.name
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
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.surname
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
                  <p
                    id="surnameError"
                    className="text-red-600 text-sm mt-2 ml-1"
                  >
                    {errors.surname}
                  </p>
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.email
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

              {/* Rôle */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Rôle *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={e =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={isLoading}
                >
                  <option value="admin">Administrateur</option>
                  <option value="professeur">Professeur</option>
                  <option value="élève">Élève</option>
                </select>
              </div>

              {/* Mot de passe (uniquement pour création) */}
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                    aria-invalid={!!errors.password}
                    aria-describedby="passwordError"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p
                      id="passwordError"
                      className="text-red-600 text-sm mt-2 ml-1"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {/* Bouton pour générer un nouveau mot de passe */}
              {selectedUser && (
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Générer un nouveau mot de passe
                </button>
              )}

              {/* Afficher le mot de passe */}
              {newPassword && (
                <div className="mt-4">
                  <p className="text-gray-700 text-sm mb-2">
                    Nouveau mot de passe :{' '}
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {newPassword}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Ce mot de passe est généré aléatoirement et n&apos;est pas
                    stocké sur nos serveurs. Il est recommandé de le stocker en
                    lieu sûr (par exemple, dans un gestionnaire de mots de
                    passe).
                  </p>
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
      role: 'student',
      usageLimit: 1,
      validityPeriod: 24,
      classId: null, // New field for class assignment
    });
    const [assignClass, setAssignClass] = useState(false); // Checkbox state
    const [existingCodes, setExistingCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const codesPerPage = 5;

    // Fetch existing codes on mount
    useEffect(() => {
      const fetchCodes = async () => {
        try {
          setLoading(true);
          console.log('token', token);
          const response = await fetch(`${API_URL}/codes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          setExistingCodes(
            data.map(code => ({
              ...code,
              createdAt: new Date(code.createdAt),
              expiresAt: new Date(code.expiresAt),
            }))
          );
        } catch (error) {
          console.error(error);
          toast.error('Erreur de chargement des codes');
        } finally {
          setLoading(false);
        }
      };
      fetchCodes();
    }, []);

    const roleDetails = {
      student: { color: 'bg-blue-100', text: 'text-blue-800', icon: <Book /> },
      teacher: {
        color: 'bg-green-100',
        text: 'text-green-800',
        icon: <User />,
      },
      admin: {
        color: 'bg-red-100',
        text: 'text-red-800',
        icon: <Shield />,
      },
    };

    const handleGenerate = async () => {
      try {
        const payload = { ...formData };
        console.log(assignClass);
        if (!assignClass) {
          delete payload.classId; // Remove classId if checkbox is not checked
        }
        console.log(payload);

        const response = await fetch(`${API_URL}/codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Erreur de génération');

        const newCode = await response.json();
        setExistingCodes([
          ...existingCodes,
          {
            ...newCode,
            createdAt: new Date(newCode.createdAt),
            expiresAt: new Date(newCode.expiresAt),
          },
        ]);

        toast.success('Code généré avec succès');
        setFormData({
          role: 'student',
          usageLimit: 1,
          validityPeriod: 24,
          classId: null,
        });
        setAssignClass(false); // Reset checkbox
      } catch (error) {
        toast.error(error.message || 'Erreur de génération');
      }
    };

    const handleDelete = async (selectedCode = null) => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await fetch(`${API_URL}/codes/${selectedCode}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) throw new Error('Erreur de suppression');

        setExistingCodes(
          existingCodes.filter(code => code.value !== selectedCode)
        );
        toast.success('Code supprimé');
        setShowConfirm(false);
      } catch (error) {
        toast.error(error.message || 'Erreur de suppression');
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
      }, 3600000); // Check every hour

      return () => clearInterval(intervalId);
    }, [existingCodes]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <option value="student">Étudiant</option>
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
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
                              className={`text-xs px-2 py-1 rounded ${
                                status === 'Actif'
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
          <SearchUser />
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

// Ajouter les styles réutilisables dans Tailwind
// const buttonStyles = 'px-4 py-2 rounded-lg flex items-center transition-colors';
// const btnPrimary = `${buttonStyles} bg-blue-600 text-white hover:bg-blue-700`;
// const btnSuccess = `${buttonStyles} bg-green-600 text-white hover:bg-green-700`;
// const btnWarning = `${buttonStyles} bg-yellow-600 text-white hover:bg-yellow-700`;
// const btnDanger = `${buttonStyles} bg-red-600 text-white hover:bg-red-700`;

UserManagement.propTypes = {
  authToken: PropTypes.string.isRequired, // Required string
  viewMode: PropTypes.oneOf(['list', 'grid']), // Optional, must be "list" or "grid"
  showCreateModal: PropTypes.bool, // Optional boolean
  fetchUsers: PropTypes.func, // Optional function
};

export default UserManagement;
