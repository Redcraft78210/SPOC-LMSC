import { useState, useEffect } from "react";
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
  Shield,
  Clock,
} from "lucide-react";

import { Toaster, toast } from "react-hot-toast";
import { use } from "react";

const API_URL = "https://localhost:8443/api";

const UserManagement = ({ authToken }) => {
  const token = authToken;

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erreur de chargement des utilisateurs");
    }
  };

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Admin User",
      email: "admin@ecole.com",
      active: true,
      role: "admin",
    },
    {
      id: 2,
      name: "Prof. Dupont",
      email: "dupont@ecole.com",
      active: true,
      role: "professeur",
    },
    {
      id: 3,
      name: "Élève Martin",
      email: "martin@ecole.com",
      active: false,
      role: "élève",
    },
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [groups, setGroups] = useState([
    { id: 3, name: "BTS1A" },
    { id: 1, name: "BTS2A" },
    { id: 2, name: "BTS2B" },
  ]);

  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("Élève");
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Gestion de la sélection
  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Actions groupées
  const bulkDelete = () => {
    if (window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    }
  };

  const bulkToggleStatus = (status) => {
    setUsers(
      users.map((user) =>
        selectedUsers.includes(user.id) ? { ...user, active: status } : user
      )
    );
  };

  const manageInvitationCodes = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setInviteCode(code);
    setShowInviteCodeModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  const deleteUser = (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      id: users.length + 1,
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    if (selectedUser) {
      setUsers(
        users.map((user) => (user.id === selectedUser.id ? newUser : user))
      );
    } else {
      setUsers([...users, newUser]);
    }
    setShowCreateModal(false);
    setSelectedUser(null);
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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    );
  };

  const ToggleView = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg ${
            viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600"
          }`}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg ${
            viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600"
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
            <button onClick={bulkDelete} className="btn-danger">
              <Trash2 className="w-5 h-5 mr-2" />
              Supprimer
            </button>
            <button
              onClick={() => bulkToggleStatus(true)}
              className="btn-success"
            >
              <Check className="w-5 h-5 mr-2" />
              Activer
            </button>
            <button
              onClick={() => bulkToggleStatus(false)}
              className="btn-warning"
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
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={!user.active ? "bg-gray-50 opacity-75" : ""}
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
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "professeur"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
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
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
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
  };

  const UserCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`bg-white p-4 rounded-lg shadow ${
              !user.active ? "opacity-75" : ""
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
                    user.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.active ? "Actif" : "Inactif"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "professeur"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
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
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-96">
          <h2 className="text-xl font-bold mb-4">
            {selectedUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}
          </h2>
          <form onSubmit={handleSubmitUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  name="name"
                  defaultValue={selectedUser?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedUser?.email}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  name="role"
                  defaultValue={selectedUser?.role || "élève"}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="admin">Administrateur</option>
                  <option value="professeur">Professeur</option>
                  <option value="élève">Élève</option>
                </select>
              </div>
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedUser ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const InvitationCodeModal = ({ onClose }) => {
    const [copiedCode, setCopiedCode] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState({
      role: "student",
      usageLimit: 1,
      validityPeriod: 24,
    });
    const [existingCodes, setExistingCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const codesPerPage = 5;

    // Fetch existing codes on mount
    useEffect(() => {
      const fetchCodes = async () => {
        try {
          setLoading(true);
          console.log("token", token);
          const response = await fetch(`${API_URL}/codes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          setExistingCodes(
            data.map((code) => ({
              ...code,
              createdAt: new Date(code.createdAt),
              expiresAt: new Date(code.expiresAt),
            }))
          );
        } catch (error) {
          toast.error("Erreur de chargement des codes");
        } finally {
          setLoading(false);
        }
      };
      fetchCodes();
    }, []);

    const roleDetails = {
      student: {
        color: "bg-blue-100",
        text: "text-blue-800",
        icon: <Book className="w-4 h-4" />,
      },
      teacher: {
        color: "bg-green-100",
        text: "text-green-800",
        icon: <User className="w-4 h-4" />,
      },
      admin: {
        color: "bg-red-100",
        text: "text-red-800",
        icon: <Shield className="w-4 h-4" />,
      },
    };

    const handleGenerate = async () => {
      try {
        const response = await fetch(`${API_URL}/codes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur de génération");

        const newCode = await response.json();
        setExistingCodes([
          ...existingCodes,
          {
            ...newCode,
            createdAt: new Date(newCode.createdAt),
            expiresAt: new Date(newCode.expiresAt),
          },
        ]);

        toast.success("Code généré avec succès");
        setFormData({ role: "student", usageLimit: 1, validityPeriod: 24 });
      } catch (error) {
        toast.error(error.message || "Erreur de génération");
      }
    };

    const handleDelete = async (selectedCode = null) => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await fetch(`${API_URL}/codes/${selectedCode}`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) throw new Error("Erreur de suppression");

        setExistingCodes(
          existingCodes.filter((code) => code.value !== selectedCode)
        );
        toast.success("Code supprimé");
        setShowConfirm(false);
      } catch (error) {
        toast.error(error.message || "Erreur de suppression");
      }
    };

    const getValidityStatus = (code) => {
      if (code.remainingUses === 0) return "Épuisé";
      if (new Date() > code.expiresAt) return "Expiré";
      return "Actif";
    };

    const copyToClipboard = async (code) => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast.success("Code copié!");
      } catch (err) {
        toast.error("Échec de la copie");
      }
    };

    useEffect(() => {
      setPage(1);
    }, [filter]);

    const filteredCodes = existingCodes.filter((code) => {
      if (filter === "active") return getValidityStatus(code) === "Actif";
      if (filter === "expired") {
        return ["Expiré", "Épuisé"].includes(getValidityStatus(code));
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
        const remainingCodes = existingCodes.filter((code) => {
          const isExpired = now > code.expiresAt;
          const isDepleted = code.remainingUses === 0;
          return !(isExpired || isDepleted);
        });

        if (remainingCodes.length !== existingCodes.length) {
          setExistingCodes(remainingCodes);
          toast.info("Codes inutiles supprimés");
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
              &times;
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
                  onChange={(e) =>
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
                  Nombre d'utilisations
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) =>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      validityPeriod: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Génération..." : "Générer le code"}
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
                  Codes d'invitation existants
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
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-1 border rounded"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="expired">Expirés/Épuisés</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {paginatedCodes.map((code) => {
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
                              className={`flex justify-space-between text-xs px-2 py-1 rounded ${color} ${text}`}
                            >
                              {icon} {code.role}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                status === "Actif"
                                  ? "bg-green-100 text-green-800"
                                  : status === "Expiré"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
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
                    {loading ? "Suppression..." : "Confirmer"}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Précédent
              </button>
              <span>
                Page {page} sur{" "}
                {Math.ceil(filteredCodes.length / codesPerPage) || 1}
              </span>
              <button
                disabled={page * codesPerPage >= filteredCodes.length}
                onClick={() => setPage((prev) => prev + 1)}
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

  return (
    <div className="container mx-auto p-6">
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
              Gérer les codes d'invitation
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <SearchUser />
          <ToggleView />
        </div>
        <BulkActions />
      </div>

      {viewMode === "list" ? <UserTable /> : <UserCards />}

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
const buttonStyles = "px-4 py-2 rounded-lg flex items-center transition-colors";
const btnPrimary = `${buttonStyles} bg-blue-600 text-white hover:bg-blue-700`;
const btnSuccess = `${buttonStyles} bg-green-600 text-white hover:bg-green-700`;
const btnWarning = `${buttonStyles} bg-yellow-600 text-white hover:bg-yellow-700`;
const btnDanger = `${buttonStyles} bg-red-600 text-white hover:bg-red-700`;

export default UserManagement;
