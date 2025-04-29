import { Users, Settings, ClipboardList, Bell, Activity, PlusCircle } from "lucide-react";

const DashboardHome = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre tableau de bord. Gérez les utilisateurs, les classes, et bien plus encore.
        </p>
      </header>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
        {/* Card 1: Gestion des utilisateurs */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Utilisateurs</h2>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Gérez les comptes des utilisateurs inscrits.</p>
          <a
            href="/users-management"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voir les utilisateurs
          </a>
        </div>

        {/* Card 2: Gestion des classes */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Classes</h2>
            <ClipboardList className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Créez et gérez les classes disponibles.</p>
          <a
            href="/classes-management"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Gérer les classes
          </a>
        </div>

        {/* Card 3: Statistiques */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Statistiques</h2>
            <ChartBar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Consultez les statistiques de la plateforme.</p>
          <a
            href="/statistics"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voir les statistiques
          </a>
        </div> */}

        {/* Card 4: Paramètres */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Paramètres</h2>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Configurez les paramètres de votre compte.</p>
          <a
            href="/settings"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Modifier les paramètres
          </a>
        </div>
      </section>

      {/* Additional Features */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-600">Notifications</h2>
            <Bell className="h-8 w-8 text-green-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-600">Nouvel utilisateur inscrit : John Doe</li>
            <li className="text-gray-600">Classe &quot;Mathématiques&quot; mise à jour</li>
            <li className="text-gray-600">Problème signalé par un utilisateur</li>
          </ul>
          <a
            href="/notifications"
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Voir toutes les notifications
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-purple-600">Activité récente</h2>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-600">John Doe a rejoint la classe &quot;Physique&quot;</li>
            <li className="text-gray-600">Nouvelle classe créée : &quot;Chimie&quot;</li>
            <li className="text-gray-600">Paramètres mis à jour par Admin</li>
          </ul>
          <a
            href="/activity-log"
            className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Voir le journal
          </a>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-orange-600">Actions rapides</h2>
            <PlusCircle className="h-8 w-8 text-orange-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li>
              <a
                href="/users-management?create-user=true"
                className="text-orange-600 hover:underline"
              >
                Ajouter un utilisateur
              </a>
            </li>
            <li>
              <a
                href="/users-management?invite-code=true"
                className="text-orange-600 hover:underline"
              >
                Créer un code d&apos;invitation
              </a>
            </li>
            <li>
              <a
                href="/classes-management?create-class=true"
                className="text-orange-600 hover:underline"
              >
                Créer une classe
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;