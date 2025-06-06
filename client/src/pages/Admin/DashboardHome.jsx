import { useNavigate } from 'react-router-dom';
import {
  Users,
  Settings,
  ClipboardList,
  Activity,
  PlusCircle,
} from 'lucide-react';
import DashboardTutorial from '../../tutorials/DashboardTutorial';
import PropTypes from 'prop-types';

// Carte réutilisable
const DashboardCard = ({
  title,
  description,
  icon: Icon,
  textColor,
  bgColor,
  onClick,
  buttonText,
  disabled,
}) => (
  <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <h2 className={`text-xl font-semibold ${textColor}`}>{title}</h2>
      <Icon className={`h-8 w-8 ${textColor}`} />
    </div>
    <p className="text-gray-600 mt-2">{description}</p>
    {onClick && (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-4 px-4 py-2 rounded-lg text-white transition ${disabled
          ? 'bg-gray-300 cursor-not-allowed'
          : `${bgColor} hover:opacity-90`
        }`}
      >
        {buttonText}
      </button>
    )}
  </div>
);

const DashboardHome = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardTutorial userRole={user.role} name={user.name} />
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Bienvenue {user.name}, gérez les utilisateurs, les classes, et bien plus encore.
        </p>
      </header>

      {/* Section principale */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Utilisateurs"
          description="Gérez les comptes des utilisateurs inscrits."
          icon={Users}
          textColor="text-teal-600"
          bgColor="bg-teal-600"
          onClick={() => navigate('/users-management')}
          buttonText="Voir les utilisateurs"
        />
        <DashboardCard
          title="Classes"
          description="Créez et gérez les classes disponibles."
          icon={ClipboardList}
          textColor="text-green-600"
          bgColor="bg-green-600"
          onClick={() => navigate('/classes-management')}
          buttonText="Gérer les classes"
        />
        <DashboardCard
          title="Paramètres"
          description="Configurez les paramètres de votre compte."
          icon={Settings}
          textColor="text-indigo-600"
          bgColor="bg-indigo-600"
          onClick={() => navigate('/settings')}
          buttonText="Modifier les paramètres"
        />
      </section>

      {/* Autres fonctionnalités */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Cours"
          description="Modérez et gérez les cours disponibles dans la bibliothèque."
          icon={ClipboardList}
          textColor="text-purple-600"
          bgColor="bg-purple-600"
          onClick={() => navigate('/courses-library')}
          buttonText="Gérer les cours"
        />
        <DashboardCard
          title="Forum"
          description="Gérez les fils de discussion communautaires et les interactions."
          icon={Activity}
          textColor="text-pink-600"
          bgColor="bg-pink-600"
          onClick={() => navigate('/forum')}
          buttonText="Accéder au forum"
        />
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
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
                onClick={() => navigate('/classes-management?create-class=true')}
                className="text-orange-600 hover:underline"
              >
                Créer une classe
              </button>
            </li>
          </ul>
        </div>
      </section >
    </div >
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  textColor: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
};

DashboardHome.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default DashboardHome;
