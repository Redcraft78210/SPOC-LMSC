/**
 * @fileoverview
 * Composant qui affiche les conditions d'utilisation de la plateforme SPOC-LMSC.
 * Présente l'ensemble des conditions générales régissant l'utilisation de la plateforme,
 * organisées par sections thématiques incluant présentation de l'application, inscription,
 * droits et responsabilités, propriété intellectuelle, et autres dispositions légales.
 */

import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';

/**
 * Composant de page affichant les conditions générales d'utilisation complètes
 * de la plateforme SPOC-LMSC. La page est structurée avec une bannière d'en-tête,
 * des sections détaillées pour chaque aspect des conditions, et un pied de page.
 * 
 * @component
 * @returns {JSX.Element} Page complète des conditions d'utilisation avec sections détaillées
 */
const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Conditions d&apos;Utilisation</h1>
          <p className="text-xl mb-8">
            Les conditions générales régissant l&apos;utilisation de la plateforme SPOC-LMSC.
          </p>
        </div>
      </header>

      {/* Terms Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Conditions Générales d&apos;Utilisation
          </h2>
          
          {/* Terms sections */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Présentation de l&apos;Application</h3>
              <p className="text-gray-700">
                SPOC-LMSC est une plateforme d&apos;apprentissage en ligne permettant aux enseignants de créer et partager du contenu pédagogique, et aux étudiants d&apos;accéder à des cours, des documents et des sessions de formation en direct.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Acceptation des Conditions</h3>
              <p className="text-gray-700">
                En accédant à l&apos;application SPOC-LMSC, vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser l&apos;application.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Inscription et Compte Utilisateur</h3>
              <div className="pl-6">
                <p className="text-gray-700 mb-2">3.1 Création de compte</p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li className="text-gray-700">L&apos;accès à l&apos;application nécessite un code d&apos;invitation valide fourni par un administrateur.</li>
                  <li className="text-gray-700">Vous devez fournir des informations exactes et complètes lors de votre inscription.</li>
                  <li className="text-gray-700">Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sur votre compte.</li>
                  <li className="text-gray-700">Les mots de passe doivent contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.</li>
                </ul>
                <p className="text-gray-700 mb-2">3.2 Authentification à deux facteurs</p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li className="text-gray-700">L&apos;application propose une authentification à deux facteurs (2FA) pour renforcer la sécurité de votre compte.</li>
                  <li className="text-gray-700">Lors de votre première connexion, vous serez invité à configurer la 2FA.</li>
                  <li className="text-gray-700">Vous êtes responsable de la sécurité des appareils utilisés pour l&apos;authentification à deux facteurs.</li>
                </ul>
                <p className="text-gray-700 mb-2">3.3 Types de comptes</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-gray-700">Étudiant : accès aux cours, documents, forums et sessions en direct.</li>
                  <li className="text-gray-700">Professeur : droits d&apos;étudiants plus la capacité de créer et gérer du contenu pédagogique.</li>
                  <li className="text-gray-700">Administrateur : droits complets de gestion de la plateforme.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Description des Services</h3>
              <p className="text-gray-700">
                La plateforme SPOC-LMSC offre les services suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Création et gestion de cours en ligne.</li>
                <li className="text-gray-700">Accès à des ressources pédagogiques variées.</li>
                <li className="text-gray-700">Outils de communication et de collaboration pour les enseignants et les étudiants.</li>
                <li className="text-gray-700">Support technique et pédagogique.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Obligations de l&apos;Éditeur</h3>
              <p className="text-gray-700">
                L&apos;éditeur s&apos;engage à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700">Fournir un accès continu et sécurisé à la plateforme, sauf en cas de maintenance programmée.</li>
                <li className="text-gray-700">Informer les utilisateurs de toute modification substantielle des fonctionnalités de la plateforme.</li>
                <li className="text-gray-700">Respecter la confidentialité des données personnelles des utilisateurs.</li>
                <li className="text-gray-700">Assurer la conformité de la plateforme avec les réglementations en vigueur.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. Propriété Intellectuelle</h3>
              <p className="text-gray-700">
                Tous les contenus disponibles sur la plateforme, y compris les cours, documents, logos et graphiques, sont protégés par des droits d&apos;auteur et sont la propriété de SPOC-LMSC ou de tiers ayant autorisé leur utilisation. Toute reproduction, distribution ou modification sans autorisation préalable est interdite.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Responsabilité de l&apos;Éditeur</h3>
              <p className="text-gray-700">
                L&apos;éditeur n&apos;est pas responsable des dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la plateforme, y compris en cas de perte de données ou d&apos;interruption de service.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Force Majeure</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">Aucune partie ne sera responsable des retards ou défaillances dus à des événements imprévisibles et irrésistibles (cyberattaques majeures, catastrophes naturelles, etc.).</li>
                <li className="text-gray-700">L&apos;application s&apos;engage à informer les utilisateurs dans les meilleurs délais en cas de tels événements.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. Données Personnelles</h3>
              <p className="text-gray-700">
                Les données personnelles collectées lors de l&apos;inscription sont nécessaires à la création de votre compte et à la fourniture des services. Elles sont traitées conformément à la politique de confidentialité de SPOC-LMSC.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">10. Cookies et Technologies de Suivi</h3>
              <p className="text-gray-700 mb-3">
                La plateforme utilise des cookies pour améliorer l&apos;expérience utilisateur. Vous pouvez gérer vos préférences en matière de cookies dans les paramètres de votre navigateur.
              </p>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">La plateforme utilise uniquement des cookies strictement nécessaires au fonctionnement technique.</li>
                <li className="text-gray-700">Aucun cookie analytique (mesure d&apos;audience) n&apos;est utilisé.</li>
                <li className="text-gray-700">Aucun cookie publicitaire ou de pistage commercial n&apos;est utilisé.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">11. Liens Hypertextes et Services Tiers</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">La plateforme peut contenir des liens vers d&apos;autres sites et ressources externes.</li>
                <li className="text-gray-700">SPOC-LMSC n&apos;est pas responsable du contenu de ces sites et décline toute responsabilité en cas de dommage résultant de leur utilisation.</li>
                <li className="text-gray-700">SPOC-LMSC décline toute responsabilité quant à la confidentialité ou aux pratiques des sites tiers.</li>
                <li className="text-gray-700">Les intégrations avec des services externes (ex : outils de visioconférence) sont soumises à leurs propres conditions d&apos;utilisation.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">12. Droit Applicable et Juridiction</h3>
              <p className="text-gray-700">
                Les présentes conditions sont régies par le droit français. Tout litige relatif à l&apos;utilisation de la plateforme sera soumis à la compétence exclusive des tribunaux français.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">13. Modifications des Conditions</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">L&apos;éditeur se réserve le droit de modifier ces CGU à tout moment.</li>
                <li className="text-gray-700">Les utilisateurs seront notifiés des changements par email et/ou via une notification dans l&apos;application 30 jours avant leur entrée en vigueur.</li>
                <li className="text-gray-700">L&apos;utilisation continue de la plateforme après cette période vaut acceptation des nouvelles conditions.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">14. Responsabilités des Utilisateurs</h3>
              <div className="pl-6">
                <p className="text-gray-700 mb-2">14.1 Les utilisateurs s&apos;engagent à :</p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li className="text-gray-700">Maintenir à jour leurs informations personnelles</li>
                  <li className="text-gray-700">Utiliser la plateforme conformément à sa destination pédagogique</li>
                  <li className="text-gray-700">Protéger leurs appareils contre tout accès non autorisé</li>
                </ul>
                <p className="text-gray-700">14.2 Le partage d&apos;identifiants ou la création de comptes multiples sont strictement interdits.</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">15. Indemnisation</h3>
              <div className="pl-6">
                <p className="text-gray-700 mb-2">15.1 L&apos;utilisateur s&apos;engage à indemniser SPOC-LMSC et ses partenaires contre toute réclamation ou dommage résultant :</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-gray-700">D&apos;une violation des présentes CGU</li>
                  <li className="text-gray-700">De contenus illicites publiés</li>
                  <li className="text-gray-700">D&apos;une utilisation abusive de la plateforme</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">16. Mineurs</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">L&apos;inscription des mineurs de moins de 15 ans nécessite le consentement écrit préalable des titulaires de l&apos;autorité parentale.</li>
                <li className="text-gray-700">Les données des mineurs sont protégées selon les dispositions spécifiques du RGPD et de la loi française.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">17. Conservation des Données</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">Les données utilisateur sont conservées 3 ans après la dernière activité sur le compte.</li>
                <li className="text-gray-700">Les contenus pédagogiques publiés peuvent être conservés à des fins d&apos;archivage pédagogique, sous forme anonymisée.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">18. Dispositions Diverses</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700"><strong>Intégralité de l&apos;Accord</strong> : Ces CGU constituent l&apos;accord entier entre les parties.</li>
                <li className="text-gray-700"><strong>Divisibilité</strong> : Si une clause est jugée invalide, les autres dispositions restent applicables.</li>
                <li className="text-gray-700"><strong>Non-Renonciation</strong> : Le fait de ne pas invoquer un droit ne constitue pas une renonciation à celui-ci.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">19. Accessibilité</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">SPOC-LMSC s&apos;engage à respecter les normes RGAA (Référentiel Général d&apos;Amélioration de l&apos;Accessibilité).</li>
                <li className="text-gray-700">Les utilisateurs peuvent signaler tout problème d&apos;accessibilité via le formulaire de contact.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">20. Export de Données</h3>
              <ul className="list-decimal pl-6 space-y-2">
                <li className="text-gray-700">Les utilisateurs peuvent exporter leurs contributions personnelles via des formats standardisés (CSV, PDF).</li>
                <li className="text-gray-700">L&apos;export de contenus pédagogiques protégés par le droit d&apos;auteur nécessite l&apos;accord écrit des titulaires des droits.</li>
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

export default TermsOfUse;