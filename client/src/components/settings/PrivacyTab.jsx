import PropTypes from 'prop-types';
import { Globe, BellIcon } from 'lucide-react';

/**
 * Composant d'onglet de confidentialité permettant aux utilisateurs de gérer leurs paramètres de confidentialité et de partage de données.
 *
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.dataSharing - État des préférences de partage de données
 * @param {boolean} props.dataSharing.analytics - Indique si l'utilisateur a autorisé les statistiques d'utilisation
 * @param {boolean} props.dataSharing.personalizedAds - Indique si l'utilisateur a autorisé les publicités personnalisées
 * @param {Function} props.setDataSharing - Fonction pour mettre à jour l'état de partage des données
 * @param {Function} props.handleInputChange - Fonction déclenchée lors de la modification d'un paramètre
 * @returns {JSX.Element} Onglet de paramètres de confidentialité
 */
const PrivacyTab = ({ dataSharing, setDataSharing, handleInputChange }) => {
  /**
   * Composant d'interrupteur personnalisé pour activer/désactiver une option
   *
   * @param {Object} props - Les propriétés du composant
   * @param {boolean} props.checked - État actuel de l'interrupteur (activé/désactivé)
   * @param {Function} props.onChange - Fonction appelée lors du changement d'état
   * @param {boolean} [props.disabled] - Indique si l'interrupteur est désactivé
   * @returns {JSX.Element} Bouton d'interrupteur stylisé
   */
  const Switch = ({ checked, onChange, disabled }) => {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  Switch.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  /**
   * Composant de case à cocher personnalisé avec un libellé
   *
   * @param {Object} props - Les propriétés du composant
   * @param {string} props.label - Texte à afficher à côté de la case à cocher
   * @param {boolean} props.checked - État actuel de la case à cocher (cochée/non cochée)
   * @param {Function} props.onChange - Fonction appelée lors du changement d'état
   * @returns {JSX.Element} Case à cocher avec libellé
   */
  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );

  Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
          <Globe className="h-6 w-6" />
          <span>Visibilité</span>
        </h2>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Profil public</h3>
              <p className="text-sm text-gray-500">
                Rendre mon profil visible par tous les utilisateurs
              </p>
            </div>
            <Switch
              checked={true}
              onChange={() => {}}
              className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full"
            >
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white" />
            </Switch>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
          <BellIcon className="h-6 w-6" />
          <span>Données et confidentialité</span>
        </h2>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Partage de données</h3>
            <div className="space-y-3">
              <Checkbox
                label="Autoriser les statistiques d'utilisation"
                checked={dataSharing.analytics}
                onChange={e => {
                  setDataSharing({
                    ...dataSharing,
                    analytics: e.target.checked,
                  });
                  handleInputChange();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PrivacyTab.propTypes = {
  dataSharing: PropTypes.shape({
    analytics: PropTypes.bool.isRequired,
    personalizedAds: PropTypes.bool.isRequired,
  }).isRequired,
  setDataSharing: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default PrivacyTab;