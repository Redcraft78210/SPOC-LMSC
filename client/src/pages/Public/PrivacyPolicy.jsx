import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Politique de Confidentialité</h1>
          <p className="text-xl mb-8">
            Notre engagement pour la protection et la sécurité de vos données personnelles.
          </p>
        </div>
      </header>

      {/* Policy Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Politique de Protection des Données
          </h2>
          
          {/* Policy sections */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h3>
              <p className="text-gray-700">
                Bienvenue sur la plateforme SPOC-LMSC. Nous accordons une importance particulière à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre service.
              </p>
              <p className="text-gray-700 mt-4">
                En utilisant SPOC-LMSC, vous acceptez les pratiques décrites dans cette politique. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Collecte des données</h3>
              <div className="pl-6">
                <p className="text-gray-700 mb-2">2.1 Données que vous nous fournissez</p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li className="text-gray-700">Informations de compte : nom, prénom, adresse email, nom d&apos;utilisateur et mot de passe.</li>
                  <li className="text-gray-700">Contenu utilisateur : messages dans les chats, publications sur le forum, commentaires et pièces jointes.</li>
                  <li className="text-gray-700">Informations de profil : photo de profil (avatar) et autres informations que vous choisissez de partager.</li>
                  <li className="text-gray-700">Communications : messages envoyés via notre système de messagerie interne.</li>
                </ul>
                <p className="text-gray-700 mb-2">2.2 Données collectées automatiquement</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-gray-700">Données d&apos;utilisation : interactions avec la plateforme, pages visitées, fonctionnalités utilisées.</li>
                  <li className="text-gray-700">Informations techniques : adresse IP, type de navigateur, appareil utilisé, système d&apos;exploitation.</li>
                  <li className="text-gray-700">Données de connexion : dates et heures d&apos;accès, durée d&apos;utilisation du service.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Utilisation des données</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Fournir, maintenir et améliorer notre plateforme</li>
                <li className="text-gray-700">Personnaliser votre expérience utilisateur</li>
                <li className="text-gray-700">Communiquer avec vous concernant votre compte ou le service</li>
                <li className="text-gray-700">Traiter vos demandes et répondre à vos questions</li>
                <li className="text-gray-700">Assurer la sécurité de notre plateforme</li>
                <li className="text-gray-700">Respecter nos obligations légales</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Partage des données</h3>
              <div className="pl-6">
                <p className="text-gray-700 mb-2">4.1 Avec d&apos;autres utilisateurs</p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li className="text-gray-700">Votre nom et prénom dans les classes, les forums et les chats</li>
                  <li className="text-gray-700">Votre photo de profil</li>
                  <li className="text-gray-700">Les contenus que vous publiez dans les forums et les chats</li>
                  <li className="text-gray-700">Vos messages dans le système de messagerie interne</li>
                </ul>
                <p className="text-gray-700 mb-2">4.2 Avec nos prestataires de services</p>
                <p className="text-gray-700 mb-3">
                  Nous pouvons partager des informations avec des prestataires de services tiers qui nous aident à exploiter notre plateforme (hébergement, analyse de données, assistance client).
                </p>
                <p className="text-gray-700 mb-2">4.3 Pour des raisons légales</p>
                <p className="text-gray-700 mb-3">
                  Nous pouvons divulguer vos informations si nous pensons de bonne foi que cette divulgation est nécessaire pour :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-gray-700">Se conformer à la loi ou à une procédure judiciaire</li>
                  <li className="text-gray-700">Protéger nos droits, notre propriété ou notre sécurité</li>
                  <li className="text-gray-700">Prévenir la fraude ou les abus</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Sécurité des données</h3>
              <p className="text-gray-700 mb-3">
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données personnelles contre l&apos;accès non autorisé, la perte ou l&apos;altération, notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Chiffrement des mots de passe et des données sensibles</li>
                <li className="text-gray-700">Authentification à deux facteurs (2FA)</li>
                <li className="text-gray-700">Surveillance et mise à jour régulière de nos systèmes</li>
                <li className="text-gray-700">Limitation de l&apos;accès aux données personnelles au personnel autorisé</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. Conservation des données</h3>
              <p className="text-gray-700 mb-3">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Si vous supprimez votre compte, vos données personnelles seront :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Anonymisées (nom, prénom, email remplacés par des valeurs génériques)</li>
                <li className="text-gray-700">Supprimées de nos systèmes actifs (messages, avatar, associations aux classes)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Conformément à notre politique de suppression, votre compte sera définitivement supprimé 30 jours après votre demande, sauf si vous vous reconnectez pendant cette période.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Vos droits</h3>
              <p className="text-gray-700 mb-3">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Droit d&apos;accès : obtenir une copie de vos données personnelles</li>
                <li className="text-gray-700">Droit de rectification : corriger des informations inexactes</li>
                <li className="text-gray-700">Droit à l&apos;effacement : demander la suppression de vos données</li>
                <li className="text-gray-700">Droit à la limitation du traitement : restreindre le traitement de vos données</li>
                <li className="text-gray-700">Droit à la portabilité : recevoir vos données dans un format structuré</li>
                <li className="text-gray-700">Droit d&apos;opposition : vous opposer au traitement de vos données</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Pour exercer ces droits, vous pouvez :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Utiliser les paramètres de confidentialité disponibles dans votre compte</li>
                <li className="text-gray-700">Nous contacter à l&apos;adresse indiquée à la fin de cette politique</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Paramètres de confidentialité</h3>
              <p className="text-gray-700 mb-3">
                Vous pouvez contrôler certains aspects de la collecte et du traitement de vos données via les paramètres de votre compte, notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Visibilité de votre profil</li>
                <li className="text-gray-700">Activation ou désactivation de l&apos;authentification à deux facteurs</li>
                <li className="text-gray-700">Paramètres de partage de données analytiques</li>
                <li className="text-gray-700">Gestion des notifications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. Transferts internationaux de données</h3>
              <p className="text-gray-700">
                Vos données personnelles peuvent être transférées et traitées dans des pays autres que celui où vous résidez. Ces pays peuvent avoir des lois différentes en matière de protection des données.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">10. Modifications de la politique de confidentialité</h3>
              <p className="text-gray-700">
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons de tout changement significatif par email ou par une notification sur notre plateforme.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">11. Protection des mineurs</h3>
              <p className="text-gray-700">
                Notre service est destiné aux personnes âgées d&apos;au moins 13 ans. Si vous avez connaissance qu&apos;un enfant de moins de 13 ans nous a fourni des informations personnelles, veuillez nous contacter.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">12. Contact</h3>
              <p className="text-gray-700 mb-3">
                Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, veuillez nous contacter à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Email : privacy@spoc-lmsc.com</li>
                <li className="text-gray-700">Adresse postale : 2 avenue Jean Jaurès, 78210 Saint-Cyr l&apos;École</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;