// import PropTypes from 'prop-types';

import { useNavigate } from 'react-router-dom';

// const DashboardHome = ({ authToken }) => {
const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenue sur votre tableau de bord
        </h1>
        <p className="text-gray-600 mt-2">
          Accédez rapidement à vos cours, activités et statistiques.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Courses */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">Mes Cours</h2>
          <p className="text-gray-600 mt-2">
            Consultez vos cours en cours et terminez vos leçons.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/courses-library')}
          >
            Voir mes cours
          </button>
        </div>

        {/* Card 2: Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">Progression</h2>
          <p className="text-gray-600 mt-2">
            Suivez vos progrès et atteignez vos objectifs.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Voir ma progression
          </button>
        </div>

        {/* Card 3: Live Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">
            Sessions en direct
          </h2>
          <p className="text-gray-600 mt-2">
            Rejoignez des sessions en direct avec vos enseignants.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Rejoindre une session
          </button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">12</h3>
            <p className="text-gray-600 mt-2">Cours terminés</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">8</h3>
            <p className="text-gray-600 mt-2">Sessions en direct suivies</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">95%</h3>
            <p className="text-gray-600 mt-2">Taux de réussite</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// DashboardHome.propTypes = {
//   authToken: PropTypes.string,
// };

export default DashboardHome;
