import { useState } from "react";
import PropTypes from "prop-types"; // Import prop-types
import {
  Globe,
  Lock,
  TrashIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [dataSharing, setDataSharing] = useState({
    analytics: true,
    personalizedAds: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const Switch = ({ checked, onChange }) => {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  Switch.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );

  Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-8">
            <h2
              id="profile-section"
              className="text-xl font-semibold text-gray-800 flex items-center space-x-2"
            >
              <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
              <span>Profil</span>
            </h2>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border hover:bg-gray-50 cursor-pointer"
                  aria-label="Changer la photo de profil"
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  <CogIcon
                    className="h-5 w-5 text-gray-600"
                    aria-hidden="true"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Cliquez sur l’icône pour modifier votre photo de profil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom
                </label>
                <input
                  id="last-name"
                  type="text"
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom d’utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Votre nom d’utilisateur"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Lock className="h-6 w-6" />
                <span>Authentification</span>
              </h2>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">
                    Authentification à deux facteurs
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={twoFactorAuth}
                    onChange={setTwoFactorAuth}
                    className={`${
                      twoFactorAuth ? "bg-blue-600" : "bg-gray-200"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        twoFactorAuth ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Configurer
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Lock className="h-6 w-6" />
                  <span>Modifier le mot de passe</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      placeholder="Entrez votre mot de passe actuel"
                      className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      placeholder="Entrez un nouveau mot de passe"
                      className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      placeholder="Confirmez le nouveau mot de passe"
                      className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Enregistrer le nouveau mot de passe
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span>Visibilité</span>
              </h2>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Profil public</h3>
                    <p className="text-sm text-gray-500">
                      Rendre mon profil visible par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white" />
                  </Switch>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <BellIcon className="h-6 w-6" />
                <span>Données et confidentialité</span>
              </h2>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Partage de données</h3>
                  <div className="space-y-3">
                    <Checkbox
                      label="Autoriser les statistiques d'utilisation"
                      checked={dataSharing.analytics}
                      onChange={(e) =>
                        setDataSharing({
                          ...dataSharing,
                          analytics: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>

        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {["general", "security", "privacy"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {tab === "general" && <CogIcon className="h-5 w-5" />}
              {tab === "security" && <Lock className="h-5 w-5" />}
              {tab === "privacy" && <Globe className="h-5 w-5" />}
              <span>
                {tab === "general" && "Général"}
                {tab === "security" && "Sécurité"}
                {tab === "privacy" && "Confidentialité"}
              </span>
            </button>
          ))}
        </div>

        {renderContent()}

        <div className="mt-8 border-t pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-600 flex items-center space-x-2">
              <TrashIcon className="h-6 w-6" />
              <span>Zone de danger</span>
            </h2>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex flex-col justify-space-around space-y-4 ">
                <div>
                  <h3 className="font-medium text-red-800">
                    Supprimer le compte
                  </h3>
                  <p className="text-sm text-red-600">
                    Cette action est irréversible et entraînera la suppression
                    définitive de toutes vos données. Votre compte sera
                    automatiquement supprimé 30 jours après votre demande, pour
                    des raisons de sécurité. Si vous vous reconnectez avant
                    cette échéance, la suppression sera annulée.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-fit"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte ?
                Toutes vos données seront perdues.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    // Ajouter logique de suppression ici
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Annuler
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
