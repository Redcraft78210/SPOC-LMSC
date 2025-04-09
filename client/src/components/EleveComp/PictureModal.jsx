import React from "react";
import { X, Earth, Pencil, Trash2 } from "lucide-react";
import Logo from "../../Logo";

const PictureModal = ({ setShowProfilepictureModal, user }) => {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      {/* Carte principale - Ajout de relative pour le positionnement absolu enfant */}
      <div className="bg-gray-800 text-gray-100 w-full max-w-sm rounded-xl shadow-lg p-4 md:p-6 relative">
        {/* Croix en haut à gauche - Modification de right-4 à left-4 */}
        <X
          className="absolute top-4 left-4 cursor-pointer"
          onClick={() => setShowProfilepictureModal(false)}
        />
        <h1 className="text-center text-xl font-bold mb-1 flex items-center justify-center gap-2">
          Compte <Logo className="w-30 h-10 inline-block" fillColor={"white"} />
        </h1>
        {/* Sous-titre */}
        <h2 className="text-2xl font-medium mb-2 mt-4">Photo de profil</h2>
        {/* Description */}
        <p className="text-sm mb-4 text-gray-300">
          Votre photo de profil aide les autres utilisateurs à vous reconnaître
          et vous permet de savoir quand vous êtes connecté à votre compte
        </p>
        {/* Section d'info : Visible par tous */}
        <div className="flex items-center mb-4 rounded border border-gray-600 w-fit p-1 hover:bg-gray-700">
          <Earth className="w-4 h-4 mr-2" />
          <span className="text-sm text-gray-200 px-2 py-1 mr-2">
            Visible par tous
          </span>
          {/* Vous pouvez éventuellement ajouter une icône ou un bouton d'info */}
        </div>
        {/* Zone de la photo de profil */}
        <div className="flex flex-col items-center mb-4">
          {/* Votre logo / lettre / image */}
          {!user.avater || user.avatar === "" || user.avatar === "default" ? (
            <div className="h-65 w-65 rounded-full border-2 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-800">
                {user.name.charAt(0)}
              </span>
            </div>
          ) : (
            <img
              // src={user.avatar}
              src="https://via.placeholder.com/150"
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Modifier l'élément"
          >
            <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Modifier</span>
          </button>

          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Supprimer l'élément"
          >
            <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PictureModal;
