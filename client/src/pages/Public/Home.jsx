/**
 * @fileoverview
 * Page d'accueil publique de l'application SPOC-LMSC.
 * Présente les fonctionnalités principales, des cours populaires et des appels à l'action
 * pour les utilisateurs non connectés.
 */

import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';

/**
 * Composant de la page d'accueil.
 * Inclut une section héro, une présentation des fonctionnalités, et des cartes de cours populaires.
 * 
 * @component
 * @returns {JSX.Element} Élément JSX représentant la page d'accueil
 */
const Home = () => {
  /**
   * Hook de navigation pour rediriger l'utilisateur vers différentes pages
   * @type {Function}
   */
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Apprenez les compétences de demain
          </h1>
          <p className="text-xl mb-8">
            Des cours réalisés par vos propres enseignants !
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/sign?register=true')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Commencer maintenant
            </button>
            <button
              onClick={() => navigate('/courses-library')}
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Voir les cours
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                +500 cours en ligne
              </h3>
              <p className="text-gray-600">
                Des formations régulièrement mises à jour
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Apprentissage flexible
              </h3>
              <p className="text-gray-600">Apprenez à votre rythme, 24h/24</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Certifications reconnues
              </h3>
              <p className="text-gray-600">Valorisez vos compétences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cours populaires
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://placehold.co/800x500"
                alt="Course"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-blue-600 text-sm font-semibold">
                  Développement Web
                </span>
                <h3 className="font-bold text-xl my-2">Fullstack JavaScript</h3>
                <p className="text-gray-600 mb-4">
                  Maîtrisez React, Node.js et MongoDB
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>📚 45 leçons</span>
                  <span>⭐ 4.9/5</span>
                </div>
                <button
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => navigate('/courses-library')}
                >
                  Voir le cours
                </button>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://placehold.co/800x500"
                alt="Course"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-blue-600 text-sm font-semibold">
                  Data Science
                </span>
                <h3 className="font-bold text-xl my-2">
                  Python & Machine Learning
                </h3>
                <p className="text-gray-600 mb-4">
                  Apprenez les fondamentaux de l&apos;IA
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>📚 32 leçons</span>
                  <span>⭐ 4.8/5</span>
                </div>
                <button
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => navigate('/courses-library')}
                >
                  Voir le cours
                </button>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://placehold.co/800x500"
                alt="Course"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-blue-600 text-sm font-semibold">
                  Marketing Digital
                </span>
                <h3 className="font-bold text-xl my-2">
                  Stratégies Social Media
                </h3>
                <p className="text-gray-600 mb-4">
                  Augmentez votre présence en ligne
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>📚 28 leçons</span>
                  <span>⭐ 4.7/5</span>
                </div>
                <button
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => navigate('/courses-library')}
                >
                  Voir le cours
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
