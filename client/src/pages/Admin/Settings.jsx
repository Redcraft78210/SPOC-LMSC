import { useState } from "react";

// Composant pour l'onglet "Informations générales"
const GeneralSettings = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800">Informations générales</h2>
    <div>
      <label className="block text-sm font-medium mb-2">Nom</label>
      <input
        type="text"
        placeholder="Votre nom"
        className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Email</label>
      <input
        type="email"
        placeholder="Votre email"
        className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Composant pour l'onglet "Sécurité"
const SecuritySettings = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800">Sécurité</h2>
    <div>
      <label className="block text-sm font-medium mb-2">Changer le mot de passe</label>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Composant pour l'onglet "Confidentialité"
const PrivacySettings = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800">Confidentialité</h2>
    <div>
      <label className="block text-sm font-medium mb-2">Qui peut voir votre profil ?</label>
      <select className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option>Tout le monde</option>
        <option>Amis uniquement</option>
        <option>Moi uniquement</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Recevoir des notifications</label>
      <select className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option>Oui</option>
        <option>Non</option>
      </select>
    </div>
  </div>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      case "privacy":
        return <PrivacySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "general" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "security" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Sécurité
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "privacy" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Confidentialité
          </button>
        </div>
        {renderContent()}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;