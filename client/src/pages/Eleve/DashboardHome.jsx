import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getStudentProgress } from '../../API/CourseCaller'; // Ajout de cette fonction dans CourseCaller

const DashboardHome = ({ authToken }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ completedCourses: 0, liveSessions: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudentProgress();
        if (response.status === 200) {
          setStats(response.data);
        } else {
          console.error('Erreur:', response.message);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchData();
  }, [authToken]);

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
            onClick={() => navigate('/courses-library?courses')}
          >
            Voir mes cours
          </button>
        </div>
        {/* Card 2: Progress
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">Progression</h2>
          <p className="text-gray-600 mt-2">
            {'Suivez vos progrès et atteignez vos objectifs.'}
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Voir ma progression
          </button>
        </div> */}
        {/* Card 3: Live Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">
            Sessions en direct
          </h2>
          <p className="text-gray-600 mt-2">
            Rejoignez des sessions en direct avec vos enseignants.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/courses-library?lives')}
          >
            Rejoindre une session
          </button>
        </div>
        {/*  Card 4: Forum  */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600">Forum</h2>
          <p className="text-gray-600 mt-2">
            Participez aux discussions et posez vos questions.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/forum')}
          >
            Accéder au forum
          </button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">
              {stats.completedCourses}
            </h3>
            <p className="text-gray-600 mt-2">Cours terminés</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">
              {stats.startedCourses || 0}
            </h3>
            <p className="text-gray-600 mt-2">Cours commencés</p>
          </div>


          {/* Stat 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-600">
              {stats.liveSessions}
            </h3>
            <p className="text-gray-600 mt-2">Sessions en direct suivies</p>
          </div>
        </div>
      </section>
    </div>
  );
};

DashboardHome.propTypes = {
  authToken: PropTypes.string.isRequired,
};

export default DashboardHome;
