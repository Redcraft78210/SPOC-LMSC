import React from "react";
import Logo from "../Logo";

const PublicNavbar = () => {
  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo className="h-20 w-auto" fillColor={"#1555ec"} alt="SPOC Logo" />
            <div className="hidden md:flex space-x-8 ml-10">
              <a
                href="/courses-library"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Cours
              </a>
              <a
                href="/about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                À propos
              </a>
              <a
                href="/contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/sign"
              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Connexion
            </a>
            <a
              href="/sign?register=true"
              className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Inscription
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;