import PublicNavbar from "../../components/PublicComp/PublicNavbar";
import Footer from "../../components/PublicComp/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">À Propos de SPOC-LMSC</h1>
          <p className="text-xl mb-8">
            Découvrez notre mission, nos valeurs et l&apos;équipe derrière cette
            plateforme.
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Notre Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                SPOC-LMSC a été créé pour offrir une plateforme d&apos;apprentissage
                en ligne accessible, flexible et enrichissante. Nous croyons en
                l&apos;importance de l&apos;éducation et souhaitons permettre à chacun de
                développer ses compétences à son propre rythme.
              </p>
            </div>

            {/* Vision */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Notre Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Nous imaginons un monde où l&apos;éducation est accessible à tous,
                peu importe leur situation géographique ou leurs contraintes
                personnelles. SPOC-LMSC vise à devenir un leader dans
                l&apos;apprentissage en ligne en proposant des cours de qualité créés
                par des enseignants passionnés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Rencontrez Notre Équipe
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img src="/img/Willi.svg" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Ewen WILLIART
                </h3>
                <p className="text-gray-600">Designer UI/UX & Développeur</p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img src="/img/Cléclé.svg" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Clément BÉLAISE
                </h3>
                <p className="text-gray-600">Directeur Technique</p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img src="/img/AD.svg" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Adrien DE CASTRO
                </h3>
                <p className="text-gray-600">Responsable Projet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
