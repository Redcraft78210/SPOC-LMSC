/**
 * @fileoverview Admin dashboard home page component that displays user management, class management, and settings.
 * Provides navigation cards for quick access to various admin functionalities.
 */

import { useNavigate } from 'react-router-dom';
import {
  Users,
  Settings,
  ClipboardList,
  Bell,
  Activity,
  PlusCircle,
} from 'lucide-react';

import DashboardTutorial from '../../tutorials/DashboardTutorial';
import PropTypes from 'prop-types';

/**
 * AdminDashboardHome Component
 * 
 * This component renders the main dashboard interface for admin users.
 * It provides navigation cards for managing users, classes, and settings,
 * as well as sections for notifications, recent activity, and quick actions.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object containing role and name
 * @param {string} props.user.role - User's role (used for tutorial)
 * @param {string} props.user.name - User's display name
 * 
 * @returns {JSX.Element} The admin dashboard home interface
 */

const AdminDashboardHome = ({ user }) => {
  /**
   * React Router navigate function used for redirecting to different pages
   * @type {Function}
   */
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardTutorial userRole={user.role} name={user.name} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre tableau de bord. Gérez les utilisateurs, les
          classes, et bien plus encore.
        </p>
      </header>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        <div className="user-management bg-white rounded-lg shadow-md p-6 lg:ml-15 lg:mr-10 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">
              Utilisateurs
            </h2>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">
            Gérez les comptes des utilisateurs inscrits.
          </p>
          <button
            onClick={() => navigate('/users-management')}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voir les utilisateurs
          </button>
        </div>

        {/* Card 2: Gestion des classes */}
        <div className="class-management bg-white rounded-lg shadow-md p-6 lg:ml-15 lg:mr-15 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Classes</h2>
            <ClipboardList className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">
            Créez et gérez les classes disponibles.
          </p>
          <button
            onClick={() => navigate('/classes-management')}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Gérer les classes
          </button>
        </div>

        {/* Card 3: Statistiques */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Statistiques</h2>
            <ChartBar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Consultez les statistiques de la plateforme.</p>
          <button
            onClick={() => navigate("/statistics")}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voir les statistiques
          </button>
        </div> */}

        {/* Card 4: Paramètres */}
        <div className="settings bg-white rounded-lg shadow-md p-6 lg:ml-10 lg:mr-15 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600">Paramètres</h2>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">
            Configurez les paramètres de votre compte.
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Modifier les paramètres
          </button>
        </div>
      </section>

      {/* Additional Features */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-600">
              Notifications
            </h2>
            <Bell className="h-8 w-8 text-green-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-600">
              Nouvel utilisateur inscrit : John Doe
            </li>
            <li className="text-gray-600">
              Classe &quot;Mathématiques&quot; mise à jour
            </li>
            <li className="text-gray-600">
              Problème signalé par un utilisateur
            </li>
          </ul>
          <button
            onClick={() => navigate('/notifications')}
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            disabled
          >
            Voir toutes les notifications
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-purple-600">
              Activité récente
            </h2>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-600">
              John Doe a rejoint la classe &quot;Physique&quot;
            </li>
            <li className="text-gray-600">
              Nouvelle classe créée : &quot;Chimie&quot;
            </li>
            <li className="text-gray-600">Paramètres mis à jour par Admin</li>
          </ul>
          <button
            onClick={() => navigate('/activity-log')}
            className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            disabled
          >
            Voir le journal
          </button>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-orange-600">
              Actions rapides
            </h2>
            <PlusCircle className="h-8 w-8 text-orange-600" />
          </div>
          <ul className="mt-4 space-y-2">
            <li>
              <button
                onClick={() => navigate('/users-management?create-user=true')}
                className="text-orange-600 hover:underline"
              >
                Ajouter un utilisateur
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/users-management?invite-code=true')}
                className="text-orange-600 hover:underline"
              >
                Créer un code d&apos;invitation
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  navigate('/classes-management?create-class=true')
                }
                className="text-orange-600 hover:underline"
              >
                Créer une classe
              </button>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

AdminDashboardHome.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default AdminDashboardHome;
