import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Mentions Légales</h1>
          <p className="text-xl mb-8">
            Informations légales concernant la plateforme SPOC-LMSC.
          </p>
        </div>
      </header>

      {/* Legal Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Mentions Légales SPOC-LMSC
          </h2>
          
          {/* Legal sections */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Informations légales</h3>
              <div className="pl-6 space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">Éditeur du site :</p>
                  <p className="text-gray-700">SPOC-LMSC</p>
                  <p className="text-gray-700">2 avenue Jean Jaurès</p>
                  <p className="text-gray-700">78210 Saint-Cyr-l&apos;École</p>
                  <p className="text-gray-700">France</p>
                  <p className="text-gray-700">Email : support@spoc-lmsc.com</p>
                  <p className="text-gray-700">Téléphone : +33 1 23 45 67 89</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Directeur de la publication :</p>
                  <p className="text-gray-700">[Nom du responsable]</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Développement et conception :</p>
                  <p className="text-gray-700">SPOC-LMSC</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Hébergement</h3>
              <div className="pl-6">
                <p className="text-gray-700">Le site SPOC-LMSC est hébergé par :</p>
                <p className="text-gray-700">[Nom de l&apos;hébergeur]</p>
                <p className="text-gray-700">[Adresse de l&apos;hébergeur]</p>
                <p className="text-gray-700">[Contact de l&apos;hébergeur]</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Propriété intellectuelle</h3>
              <div className="pl-6 space-y-3">
                <p className="text-gray-700">
                  L&apos;ensemble des éléments constituant le site SPOC-LMSC (textes, graphismes, logiciels, images, 
                  vidéos, sons, plans, logos, marques, etc.) sont la propriété exclusive de SPOC-LMSC ou 
                  font l&apos;objet d&apos;une autorisation d&apos;utilisation. Ces éléments sont protégés par les lois 
                  relatives à la propriété intellectuelle.
                </p>
                <p className="text-gray-700">
                  Ce logiciel est distribué sous licence GNU General Public License v3, dont les termes 
                  complets sont disponibles dans le fichier LICENSE.
                </p>
                <p className="text-gray-700">
                  Toute reproduction, représentation, modification, publication, adaptation, totale ou 
                  partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est 
                  interdite sans autorisation préalable.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Protection des données personnelles</h3>
              <div className="pl-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.1 Collecte des données personnelles</h4>
                  <p className="text-gray-700 mb-2">
                    Dans le cadre de l&apos;utilisation de SPOC-LMSC, nous collectons et traitons les données 
                    personnelles suivantes :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Informations d&apos;identification (nom, prénom, adresse email, nom d&apos;utilisateur)</li>
                    <li className="text-gray-700">Données de connexion et d&apos;utilisation</li>
                    <li className="text-gray-700">Contenu généré par l&apos;utilisateur (messages, commentaires, fichiers)</li>
                    <li className="text-gray-700">Image de profil (avatar)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.2 Finalités du traitement</h4>
                  <p className="text-gray-700 mb-2">
                    Les données personnelles sont collectées et traitées pour les finalités suivantes :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Gestion des comptes utilisateurs</li>
                    <li className="text-gray-700">Fourniture des services éducatifs</li>
                    <li className="text-gray-700">Communication entre utilisateurs</li>
                    <li className="text-gray-700">Amélioration de l&apos;expérience utilisateur</li>
                    <li className="text-gray-700">Respect des obligations légales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.3 Base légale</h4>
                  <p className="text-gray-700 mb-2">
                    Le traitement de vos données personnelles est justifié par :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">L&apos;exécution du contrat de service éducatif</li>
                    <li className="text-gray-700">Votre consentement</li>
                    <li className="text-gray-700">L&apos;intérêt légitime de SPOC-LMSC</li>
                    <li className="text-gray-700">Le respect des obligations légales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.4 Durée de conservation</h4>
                  <p className="text-gray-700">
                    Les données personnelles sont conservées pour la durée nécessaire à la fourniture des 
                    services. En cas de suppression de compte, vos données seront anonymisées dans un délai 
                    de 30 jours conformément à notre politique de suppression.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.5 Droits des utilisateurs</h4>
                  <p className="text-gray-700 mb-2">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez 
                    des droits suivants :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-3">
                    <li className="text-gray-700">Droit d&apos;accès à vos données</li>
                    <li className="text-gray-700">Droit de rectification</li>
                    <li className="text-gray-700">Droit à l&apos;effacement (droit à l&apos;oubli)</li>
                    <li className="text-gray-700">Droit à la limitation du traitement</li>
                    <li className="text-gray-700">Droit à la portabilité des données</li>
                    <li className="text-gray-700">Droit d&apos;opposition</li>
                    <li className="text-gray-700">Droit de retirer votre consentement à tout moment</li>
                  </ul>
                  <p className="text-gray-700 mb-2">Pour exercer ces droits, vous pouvez :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Utiliser les fonctionnalités intégrées dans votre compte utilisateur</li>
                    <li className="text-gray-700">Contacter notre équipe à l&apos;adresse : moderation@spoc.lmsc</li>
                    <li className="text-gray-700">Remplir notre formulaire de contact</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.6 Transferts de données</h4>
                  <p className="text-gray-700">
                    Nous nous engageons à ne pas transférer vos données personnelles en dehors de l&apos;Union 
                    Européenne sans garanties appropriées.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">4.7 Sécurité des données</h4>
                  <p className="text-gray-700 mb-2">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                    protéger vos données personnelles, notamment :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Authentification à deux facteurs</li>
                    <li className="text-gray-700">Chiffrement des données sensibles</li>
                    <li className="text-gray-700">Politique de contrôle d&apos;accès strict</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Conditions d&apos;utilisation</h3>
              <div className="pl-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">5.1 Accès au service</h4>
                  <p className="text-gray-700">
                    L&apos;accès à SPOC-LMSC nécessite un code d&apos;invitation valide et la création d&apos;un compte 
                    utilisateur. L&apos;inscription est soumise à l&apos;acceptation des présentes conditions.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">5.2 Comportement des utilisateurs</h4>
                  <p className="text-gray-700 mb-2">Les utilisateurs s&apos;engagent à :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Respecter les lois en vigueur</li>
                    <li className="text-gray-700">Ne pas partager de contenu inapproprié, offensant ou illégal</li>
                    <li className="text-gray-700">Ne pas usurper l&apos;identité d&apos;un tiers</li>
                    <li className="text-gray-700">Ne pas perturber le fonctionnement du service</li>
                    <li className="text-gray-700">Ne pas collecter les données d&apos;autres utilisateurs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">5.3 Modération et sanctions</h4>
                  <p className="text-gray-700 mb-2">
                    En cas de non-respect des règles d&apos;utilisation, les modérateurs peuvent prendre les 
                    mesures suivantes :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Avertissement</li>
                    <li className="text-gray-700">Restriction temporaire des fonctionnalités</li>
                    <li className="text-gray-700">Surveillance accrue</li>
                    <li className="text-gray-700">Suspension ou suppression du compte</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">5.4 Suppression de compte</h4>
                  <p className="text-gray-700">
                    Vous pouvez demander la suppression de votre compte depuis les paramètres. La suppression 
                    sera effective 30 jours après votre demande. Pendant cette période, vous pouvez annuler 
                    la suppression en vous reconnectant.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies et technologies similaires</h3>
              <div className="pl-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">6.1 Qu&apos;est-ce qu&apos;un cookie ?</h4>
                  <p className="text-gray-700">
                    Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur 
                    notre plateforme. Les cookies nous permettent de reconnaître votre appareil et de stocker 
                    des informations sur vos préférences.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">6.2 Types de cookies utilisés</h4>
                  <p className="text-gray-700 mb-2">Nous utilisons les types de cookies suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-gray-700">Cookies techniques essentiels au fonctionnement du service</li>
                    <li className="text-gray-700">Cookies de session pour l&apos;authentification</li>
                    <li className="text-gray-700">Cookies de préférences pour personnaliser votre expérience</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">6.3 Gestion des cookies</h4>
                  <p className="text-gray-700">
                    Vous pouvez configurer votre navigateur pour refuser les cookies. Cependant, certaines 
                    fonctionnalités essentielles pourraient ne pas fonctionner correctement.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation de responsabilité</h3>
              <div className="pl-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">7.1 Disponibilité du service</h4>
                  <p className="text-gray-700">
                    SPOC-LMSC s&apos;efforce d&apos;assurer la disponibilité du service 24h/24 et 7j/7. Toutefois, 
                    nous ne pouvons garantir une disponibilité sans interruption et déclinons toute 
                    responsabilité en cas d&apos;indisponibilité temporaire.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">7.2 Contenu généré par les utilisateurs</h4>
                  <p className="text-gray-700">
                    SPOC-LMSC n&apos;exerce pas de contrôle préalable sur le contenu publié par les utilisateurs 
                    et ne peut être tenu responsable des contenus illicites ou inappropriés avant leur 
                    signalement.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">7.3 Garanties et responsabilités</h4>
                  <p className="text-gray-700">
                    Conformément à la licence GNU GPL v3, le programme est fourni &quot;tel quel&quot;, sans aucune 
                    garantie, explicite ou implicite, concernant sa qualité et ses performances. Les auteurs 
                    ou détenteurs du copyright ne pourront être tenus responsables des dommages, de quelque 
                    nature qu&apos;ils soient, causés par l&apos;utilisation ou l&apos;impossibilité d&apos;utilisation du 
                    programme.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Loi applicable et juridiction</h3>
              <div className="pl-6">
                <p className="text-gray-700">
                  Les présentes mentions légales sont soumises au droit français. En cas de litige, les 
                  tribunaux français seront seuls compétents.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. Contact</h3>
              <div className="pl-6">
                <p className="text-gray-700">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l&apos;adresse 
                  suivante : support@spoc-lmsc.com
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm italic text-center">
                Dernière mise à jour : 27 mai 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LegalNotice;